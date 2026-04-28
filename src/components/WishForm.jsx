import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { generateBirthdayMessages } from '../lib/gemini'

/* ---- Relationship Options ---- */
const RELATIONSHIPS = [
  { value: 'mpenzi', label: 'Mpenzi / Girlfriend / Boyfriend', emoji: '💕' },
  { value: 'mama', label: 'Mama', emoji: '👩' },
  { value: 'baba', label: 'Baba', emoji: '👨' },
  { value: 'rafiki', label: 'Rafiki wa karibu', emoji: '👫' },
  { value: 'dada', label: 'Dada', emoji: '👩‍👧' },
  { value: 'kaka', label: 'Kaka', emoji: '👨‍👦' },
  { value: 'boss', label: 'Boss / Mkurugenzi', emoji: '💼' },
  { value: 'mwalimu', label: 'Mwalimu', emoji: '📚' },
  { value: 'jirani', label: 'Jirani / Mwenzangu', emoji: '🏘️' },
]

/* ---- Animation Variants ---- */
const fieldVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut', delay: 0.15 + i * 0.1 },
  }),
}

export default function WishForm() {
  /* ========== STATE ========== */
  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [senderMessage, setSenderMessage] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState('')
  const [errors, setErrors] = useState({})
  const [shareUrl, setShareUrl] = useState(null)
  const [copied, setCopied] = useState(false)

  const fileInputRef = useRef(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  /* ---- Cleanup blob URL ---- */
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
    }
  }, [imagePreviewUrl])

  /* ---- Close dropdown on outside click ---- */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* ========== IMAGE HANDLERS ========== */
  const selectImage = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
    setImageFile(file)
    setImagePreviewUrl(URL.createObjectURL(file))
    setErrors((p) => ({ ...p, image: '' }))
  }

  const clearImage = () => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
    setImageFile(null)
    setImagePreviewUrl(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    selectImage(e.dataTransfer.files?.[0])
  }

  /* ========== VALIDATION ========== */
  const validate = () => {
    const e = {}
    if (!name.trim()) e.name = 'Tafadhali jaza jina'
    if (!relationship) e.relationship = 'Chagua relationship'
    if (!senderMessage.trim()) e.senderMessage = 'Tafadhali andika ujumbe wako'
    if (!imageFile) e.image = 'Tafadhali upload picha'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  /* ========== GENERATE (ASYNC FLOW) ========== */
  const handleGenerate = async () => {
    if (!validate()) return

    try {
      setIsLoading(true)

      // Step 1 — Upload image to Cloudinary
      setLoadingStep('Inapakia picha kwenye Cloudinary...')
      
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      
      if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary credentials missing in .env')
      }

      const formData = new FormData()
      formData.append('file', imageFile)
      formData.append('upload_preset', uploadPreset)

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { 
        method: 'POST', 
        body: formData 
      })
      if (!uploadRes.ok) throw new Error('Upload failed')
      
      const uploadData = await uploadRes.json()
      const imageUrl = uploadData.secure_url

      // Step 2 — Generate AI messages
      setLoadingStep('Inaandaa ujumbe mzuri wa AI...')
      const aiMessages = await generateBirthdayMessages(name, selectedRel?.label || relationship)

      // Step 3 — Create wish in database
      setLoadingStep('Inahifadhi birthday wishes zako...')
      const { data, error } = await supabase
        .from('wishes')
        .insert([{ 
          name, 
          relationship,
          sender_message: senderMessage,
          image_url: imageUrl,
          message_1: aiMessages[0],
          message_2: aiMessages[1],
          message_3: aiMessages[2]
        }])
        .select()
        .single()
        
      if (error) throw new Error(error.message)

      // Step 4 — Success
      setShareUrl(`${window.location.origin}/wish/${data.id}`)
      setIsLoading(false)
    } catch (err) {
      console.error(err)
      setIsLoading(false)
      alert(err.message === 'Cloudinary credentials missing in .env' ? 'Tafadhali weka Cloudinary credentials kwenye .env file.' : 'Kuna tatizo. Jaribu tena.')
    }
  }

  /* ========== COPY & SHARE ========== */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {
      const el = document.getElementById('share-url-input')
      el?.select()
      document.execCommand('copy')
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /* ========== RESET ========== */
  const handleReset = () => {
    clearImage()
    setName('')
    setRelationship('')
    setSenderMessage('')
    setErrors({})
    setShareUrl(null)
    setCopied(false)
    setLoadingStep('')
  }

  /* ========== SELECTED RELATIONSHIP ========== */
  const selectedRel = RELATIONSHIPS.find((r) => r.value === relationship)

  /* ========================================
     RENDER
     ======================================== */
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="p-7 md:p-9"
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(255,107,107,0.12), 0 8px 24px rgba(0,0,0,0.04)',
        border: '1px solid rgba(232,213,196,0.4)',
      }}
    >
      <AnimatePresence mode="wait">
        {!shareUrl ? (
          /* ========================
             FORM STATE
             ======================== */
          <motion.div
            key="form"
            initial={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35 }}
          >
            {/* ---- Field 1: Name ---- */}
            <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible" className="mb-6">
              <label
                htmlFor="name-input"
                className="block mb-2.5"
                style={{ fontFamily: 'var(--font-dancing)', fontSize: '18px', color: '#FF6B6B' }}
              >
                👤 Jina la Mtu
              </label>
              <input
                id="name-input"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (errors.name) setErrors((p) => ({ ...p, name: '' }))
                }}
                placeholder="Andika jina hapa..."
                className="w-full outline-none transition-all duration-300"
                style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: `2px solid ${errors.name ? '#E53E3E' : '#E8D5C4'}`,
                  fontFamily: 'var(--font-dm)',
                  fontSize: '16px',
                  color: '#2D2D2D',
                  backgroundColor: '#FFFFFF',
                }}
                onFocus={(e) => {
                  if (!errors.name) {
                    e.target.style.borderColor = '#FF6B6B'
                    e.target.style.boxShadow = '0 0 0 4px rgba(255,107,107,0.15)'
                  }
                }}
                onBlur={(e) => {
                  if (!errors.name) {
                    e.target.style.borderColor = '#E8D5C4'
                    e.target.style.boxShadow = 'none'
                  }
                }}
              />
              {errors.name && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs mt-1.5 ml-1" style={{ fontFamily: 'var(--font-dm)', color: '#E53E3E' }}>
                  {errors.name}
                </motion.p>
              )}
            </motion.div>

            {/* ---- Field 2: Relationship Dropdown ---- */}
            <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible" className="mb-6">
              <label
                className="block mb-2.5"
                style={{ fontFamily: 'var(--font-dancing)', fontSize: '18px', color: '#FF6B6B' }}
              >
                💝 Relationship
              </label>
              <div ref={dropdownRef} className="relative" id="relationship-dropdown">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full text-left cursor-pointer transition-all duration-300 outline-none relative"
                  style={{
                    padding: '14px 18px',
                    paddingRight: '44px',
                    borderRadius: '12px',
                    border: `2px solid ${errors.relationship ? '#E53E3E' : dropdownOpen ? '#FF6B6B' : '#E8D5C4'}`,
                    backgroundColor: '#FFFFFF',
                    fontFamily: 'var(--font-dm)',
                    fontSize: '16px',
                    color: selectedRel ? '#2D2D2D' : '#A89585',
                    boxShadow: dropdownOpen ? '0 0 0 4px rgba(255,107,107,0.15)' : 'none',
                  }}
                >
                  {selectedRel ? (
                    <span><span className="mr-2">{selectedRel.emoji}</span>{selectedRel.label}</span>
                  ) : (
                    'Chagua relationship...'
                  )}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-4 top-1/2 transition-transform duration-300" style={{ transform: `translateY(-50%) rotate(${dropdownOpen ? '180' : '0'}deg)` }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="absolute z-50 w-full mt-2 overflow-hidden"
                      style={{
                        borderRadius: '14px',
                        backgroundColor: '#FFFFFF',
                        border: '2px solid #E8D5C4',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.08), 0 4px 12px rgba(255,107,107,0.06)',
                      }}
                    >
                      <div className="py-1.5 max-h-[280px] overflow-y-auto">
                        {RELATIONSHIPS.map((rel) => (
                          <button
                            key={rel.value}
                            type="button"
                            onClick={() => {
                              setRelationship(rel.value)
                              setDropdownOpen(false)
                              if (errors.relationship) setErrors((p) => ({ ...p, relationship: '' }))
                            }}
                            className="w-full text-left cursor-pointer transition-all duration-200 flex items-center gap-3"
                            style={{
                              padding: '12px 18px',
                              fontFamily: 'var(--font-dm)',
                              fontSize: '15px',
                              color: '#2D2D2D',
                              backgroundColor: rel.value === relationship ? '#FFF0ED' : 'transparent',
                              borderLeft: `3px solid ${rel.value === relationship ? '#FF6B6B' : 'transparent'}`,
                              border: 'none',
                              borderLeftWidth: '3px',
                              borderLeftStyle: 'solid',
                              borderLeftColor: rel.value === relationship ? '#FF6B6B' : 'transparent',
                            }}
                            onMouseEnter={(e) => {
                              if (rel.value !== relationship) {
                                e.currentTarget.style.backgroundColor = '#FFF5F3'
                                e.currentTarget.style.borderLeftColor = '#FFB4A2'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (rel.value !== relationship) {
                                e.currentTarget.style.backgroundColor = 'transparent'
                                e.currentTarget.style.borderLeftColor = 'transparent'
                              }
                            }}
                          >
                            <span className="text-lg">{rel.emoji}</span>
                            <span>{rel.label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {errors.relationship && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs mt-1.5 ml-1" style={{ fontFamily: 'var(--font-dm)', color: '#E53E3E' }}>
                    {errors.relationship}
                  </motion.p>
                )}
              </div>
            </motion.div>

            {/* ---- Field 2.5: Sender Message ---- */}
            <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible" className="mb-6">
              <label
                htmlFor="message-input"
                className="block mb-2.5"
                style={{ fontFamily: 'var(--font-dancing)', fontSize: '18px', color: '#FF6B6B' }}
              >
                💌 Ujumbe Wako
              </label>
              <textarea
                id="message-input"
                value={senderMessage}
                onChange={(e) => {
                  setSenderMessage(e.target.value)
                  if (errors.senderMessage) setErrors((p) => ({ ...p, senderMessage: '' }))
                }}
                placeholder="Andika ujumbe wako wa moyoni hapa..."
                className="w-full outline-none transition-all duration-300 resize-none"
                rows="3"
                style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: `2px solid ${errors.senderMessage ? '#E53E3E' : '#E8D5C4'}`,
                  fontFamily: 'var(--font-dm)',
                  fontSize: '16px',
                  color: '#2D2D2D',
                  backgroundColor: '#FFFFFF',
                }}
                onFocus={(e) => {
                  if (!errors.senderMessage) {
                    e.target.style.borderColor = '#FF6B6B'
                    e.target.style.boxShadow = '0 0 0 4px rgba(255,107,107,0.15)'
                  }
                }}
                onBlur={(e) => {
                  if (!errors.senderMessage) {
                    e.target.style.borderColor = '#E8D5C4'
                    e.target.style.boxShadow = 'none'
                  }
                }}
              />
              {errors.senderMessage && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs mt-1.5 ml-1" style={{ fontFamily: 'var(--font-dm)', color: '#E53E3E' }}>
                  {errors.senderMessage}
                </motion.p>
              )}
            </motion.div>

            {/* ---- Field 3: Image Upload ---- */}
            <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible" className="mb-8">
              <label
                className="block mb-2.5"
                style={{ fontFamily: 'var(--font-dancing)', fontSize: '18px', color: '#FF6B6B' }}
              >
                📷 Pakia Picha
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => selectImage(e.target.files?.[0])}
                className="hidden"
                id="image-upload-input"
              />

              {!imagePreviewUrl ? (
                /* Empty upload zone */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
                  onDrop={handleDrop}
                  className="cursor-pointer flex flex-col items-center justify-center gap-2.5 transition-all duration-300"
                  style={{
                    height: '130px',
                    borderRadius: '16px',
                    border: `2px dashed ${errors.image ? '#E53E3E' : '#FFB4A2'}`,
                    backgroundColor: '#FFF5F3',
                  }}
                  id="image-upload-zone"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <p className="text-sm" style={{ fontFamily: 'var(--font-dm)', color: '#B08B7A' }}>
                    Bonyeza hapa au drag picha yake
                  </p>
                </div>
              ) : (
                /* Image preview */
                <div
                  className="flex items-center gap-4 py-4 px-4 transition-all duration-300"
                  style={{
                    borderRadius: '16px',
                    border: '2px solid #FFB4A2',
                    backgroundColor: '#FFF5F3',
                  }}
                >
                  <img
                    src={imagePreviewUrl}
                    alt="Preview"
                    className="shrink-0 object-cover"
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      border: '2px solid #FF6B6B',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate" style={{ fontFamily: 'var(--font-dm)', color: '#2D2D2D' }}>
                      {imageFile?.name}
                    </p>
                    <button
                      onClick={clearImage}
                      className="text-xs mt-1 font-medium cursor-pointer hover:underline"
                      style={{ fontFamily: 'var(--font-dm)', color: '#E53E3E', background: 'none', border: 'none', padding: 0 }}
                    >
                      × Badilisha
                    </button>
                  </div>
                </div>
              )}

              {errors.image && !imagePreviewUrl && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs mt-1.5 ml-1" style={{ fontFamily: 'var(--font-dm)', color: '#E53E3E' }}>
                  {errors.image}
                </motion.p>
              )}
            </motion.div>

            {/* ---- Generate Button ---- */}
            <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible">
              <motion.button
                onClick={handleGenerate}
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.02, filter: 'brightness(1.05)' } : {}}
                whileTap={!isLoading ? { scale: 0.97 } : {}}
                className="w-full flex items-center justify-center gap-2.5 font-semibold cursor-pointer transition-shadow duration-300 disabled:cursor-not-allowed"
                style={{
                  height: '54px',
                  borderRadius: '14px',
                  background: isLoading
                    ? 'linear-gradient(135deg, #FFB4A2, #FFE66D)'
                    : 'linear-gradient(135deg, #FF6B6B, #FFE66D)',
                  border: 'none',
                  fontFamily: 'var(--font-dm)',
                  fontSize: '17px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  boxShadow: '0 8px 30px rgba(255,107,107,0.3)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                }}
                id="generate-btn"
              >
                {isLoading ? (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.4)" strokeWidth="3" fill="none" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
                    </svg>
                    <span>{loadingStep || 'Inatengeneza...'}</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>Generate Birthday Wishes</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          /* ========================
             SUCCESS STATE
             ======================== */
          <motion.div
            key="success"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col items-center text-center"
          >
            {/* Green checkmark */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
              className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
              style={{ background: 'linear-gradient(135deg, #38A169, #68D391)', boxShadow: '0 8px 30px rgba(56,161,105,0.3)' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.div>

            <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-playfair)', color: '#2D2D2D' }}>
              🎉 Imefanikiwa!
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-sm mb-6" style={{ fontFamily: 'var(--font-dm)', color: '#6B6B6B' }}>
              Link yako ya birthday wishes iko tayari kushared!
            </motion.p>

            {/* URL box */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="w-full mb-5">
              <input
                id="share-url-input"
                type="text"
                readOnly
                value={shareUrl}
                onClick={(e) => e.target.select()}
                className="w-full text-center text-sm outline-none font-mono"
                style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #E8D5C4', backgroundColor: '#FFF9F0', fontFamily: 'var(--font-dm)', color: '#2D2D2D' }}
              />
            </motion.div>

            {/* Action buttons */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex gap-3 w-full mb-6">
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 font-semibold text-sm cursor-pointer transition-all duration-300"
                style={{
                  padding: '14px 20px',
                  borderRadius: '12px',
                  border: '2px solid #FF6B6B',
                  backgroundColor: copied ? '#FF6B6B' : 'transparent',
                  color: copied ? '#FFFFFF' : '#FF6B6B',
                  fontFamily: 'var(--font-dm)',
                }}
                id="copy-link-btn"
              >
                {copied ? '✓ Imenakiliwa!' : '📋 Copy Link'}
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent('Angalia birthday wishes zako! ' + shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 font-semibold text-sm no-underline transition-all duration-300"
                style={{ padding: '14px 20px', borderRadius: '12px', backgroundColor: '#25D366', color: '#FFFFFF', fontFamily: 'var(--font-dm)' }}
                id="share-whatsapp-btn"
              >
                📲 Share WhatsApp
              </a>
            </motion.div>

            {/* Reset */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              onClick={handleReset}
              className="text-sm font-medium cursor-pointer hover:underline"
              style={{ fontFamily: 'var(--font-dm)', color: '#FF6B6B', background: 'none', border: 'none', padding: 0 }}
              id="create-new-btn"
            >
              + Tengeneza nyingine
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
