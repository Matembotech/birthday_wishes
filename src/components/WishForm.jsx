import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { generateBirthdayMessages } from '../lib/gemini'

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

const LOADING_STEPS = [
  { text: 'Inapakia picha...', icon: '📤' },
  { text: 'AI inaandika ujumbe...', icon: '🤖' },
  { text: 'Inahifadhi wishes...', icon: '💾' },
]

const fieldVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.12 + i * 0.1 },
  }),
}

function FloatingLabel({ children, color = '#FF6B6B' }) {
  return (
    <motion.label
      className="flex items-center gap-2 mb-2.5"
      style={{ fontFamily: 'var(--font-dancing)', fontSize: '18px', color }}
    >
      {children}
    </motion.label>
  )
}

function StyledInput({ id, value, onChange, placeholder, error, onFocus, onBlur }) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full outline-none transition-all duration-300"
        style={{
          padding: '13px 16px',
          borderRadius: '12px',
          border: `2px solid ${error ? '#E53E3E' : focused ? '#FF6B6B' : '#E8D5C4'}`,
          fontFamily: 'var(--font-dm)',
          fontSize: '15px',
          color: '#2D2D2D',
          backgroundColor: focused ? '#FFFAF8' : '#FFFFFF',
          boxShadow: focused ? '0 0 0 4px rgba(255,107,107,0.12), 0 4px 12px rgba(255,107,107,0.08)' : '0 2px 6px rgba(0,0,0,0.03)',
        }}
        onFocus={() => { setFocused(true); onFocus?.() }}
        onBlur={() => { setFocused(false); onBlur?.() }}
      />
      {/* Focus ring pulse */}
      {focused && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ border: '2px solid rgba(255,107,107,0.4)', borderRadius: '12px' }}
        />
      )}
    </div>
  )
}

function FieldError({ msg }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -4, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -4, height: 0 }}
      className="text-xs mt-1.5 ml-1 flex items-center gap-1"
      style={{ fontFamily: 'var(--font-dm)', color: '#E53E3E' }}
    >
      <span>●</span> {msg}
    </motion.p>
  )
}

export default function WishForm() {
  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [senderMessage, setSenderMessage] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStepIdx, setLoadingStepIdx] = useState(0)
  const [loadingStep, setLoadingStep] = useState('')
  const [errors, setErrors] = useState({})
  const [shareUrl, setShareUrl] = useState(null)
  const [copied, setCopied] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const fileInputRef = useRef(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    return () => { if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl) }
  }, [imagePreviewUrl])

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* Loading step cycling */
  useEffect(() => {
    if (!isLoading) { setLoadingStepIdx(0); return }
    const interval = setInterval(() => {
      setLoadingStepIdx((prev) => (prev + 1) % LOADING_STEPS.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [isLoading])

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
    setIsDragging(false)
    selectImage(e.dataTransfer.files?.[0])
  }

  const validate = () => {
    const e = {}
    if (!name.trim()) e.name = 'Tafadhali jaza jina'
    if (!relationship) e.relationship = 'Chagua relationship'
    if (!senderMessage.trim()) e.senderMessage = 'Tafadhali andika ujumbe wako'
    if (!imageFile) e.image = 'Tafadhali upload picha'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleGenerate = async () => {
    if (!validate()) return

    try {
      setIsLoading(true)

      setLoadingStep('Inapakia picha kwenye Cloudinary...')
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

      if (!cloudName || !uploadPreset) throw new Error('Cloudinary credentials missing in .env')

      const formData = new FormData()
      formData.append('file', imageFile)
      formData.append('upload_preset', uploadPreset)

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      })
      if (!uploadRes.ok) throw new Error('Upload failed')
      const uploadData = await uploadRes.json()
      const imageUrl = uploadData.secure_url

      setLoadingStep('Inaandaa ujumbe mzuri wa AI...')
      const aiMessages = await generateBirthdayMessages(name, selectedRel?.label || relationship)

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
          message_3: aiMessages[2],
        }])
        .select()
        .single()

      if (error) throw new Error(error.message)
      setShareUrl(`${window.location.origin}/wish/${data.id}`)
      setIsLoading(false)
    } catch (err) {
      console.error(err)
      setIsLoading(false)
      alert(
        err.message === 'Cloudinary credentials missing in .env'
          ? 'Tafadhali weka Cloudinary credentials kwenye .env file.'
          : 'Kuna tatizo. Jaribu tena.'
      )
    }
  }

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

  const selectedRel = RELATIONSHIPS.find((r) => r.value === relationship)

  return (
    <div className="p-6 sm:p-8">
      <AnimatePresence mode="wait">
        {!shareUrl ? (
          <motion.div
            key="form"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, x: -40, scale: 0.96 }}
            transition={{ duration: 0.4 }}
          >
            {/* Section header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-7 text-center"
            >
              <p
                className="text-xs uppercase tracking-widest font-semibold"
                style={{ fontFamily: 'var(--font-dm)', color: '#FFB4A2', letterSpacing: '0.15em' }}
              >
                Hatua ya kwanza
              </p>
              <h3
                className="text-xl font-bold mt-1"
                style={{ fontFamily: 'var(--font-playfair)', color: '#2D2D2D' }}
              >
                Jaza Maelezo
              </h3>
              <div
                className="mx-auto mt-2"
                style={{ width: '40px', height: '2px', background: 'linear-gradient(90deg,#FF6B6B,#FFE66D)', borderRadius: '1px' }}
              />
            </motion.div>

            {/* Field 1: Name */}
            <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible" className="mb-5">
              <FloatingLabel>👤 Jina la Mtu</FloatingLabel>
              <StyledInput
                id="name-input"
                value={name}
                onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: '' })) }}
                placeholder="Andika jina hapa..."
                error={errors.name}
              />
              <AnimatePresence>{errors.name && <FieldError msg={errors.name} />}</AnimatePresence>
            </motion.div>

            {/* Field 2: Relationship */}
            <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible" className="mb-5">
              <FloatingLabel>💝 Relationship</FloatingLabel>
              <div ref={dropdownRef} className="relative" id="relationship-dropdown">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full text-left cursor-pointer outline-none relative transition-all duration-300"
                  style={{
                    padding: '13px 16px',
                    paddingRight: '44px',
                    borderRadius: '12px',
                    border: `2px solid ${errors.relationship ? '#E53E3E' : dropdownOpen ? '#FF6B6B' : '#E8D5C4'}`,
                    backgroundColor: dropdownOpen ? '#FFFAF8' : '#FFFFFF',
                    fontFamily: 'var(--font-dm)',
                    fontSize: '15px',
                    color: selectedRel ? '#2D2D2D' : '#A89585',
                    boxShadow: dropdownOpen ? '0 0 0 4px rgba(255,107,107,0.12), 0 4px 12px rgba(255,107,107,0.08)' : '0 2px 6px rgba(0,0,0,0.03)',
                  }}
                >
                  {selectedRel
                    ? <span><span className="mr-2">{selectedRel.emoji}</span>{selectedRel.label}</span>
                    : 'Chagua relationship...'
                  }
                  <motion.div
                    animate={{ rotate: dropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </motion.div>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="absolute z-50 w-full mt-2 overflow-hidden"
                      style={{
                        borderRadius: '14px',
                        backgroundColor: '#FFFFFF',
                        border: '2px solid #E8D5C4',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.1), 0 4px 16px rgba(255,107,107,0.07)',
                      }}
                    >
                      <div className="py-1.5 max-h-[260px] overflow-y-auto">
                        {RELATIONSHIPS.map((rel, i) => (
                          <motion.button
                            key={rel.value}
                            type="button"
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => {
                              setRelationship(rel.value)
                              setDropdownOpen(false)
                              if (errors.relationship) setErrors((p) => ({ ...p, relationship: '' }))
                            }}
                            className="w-full text-left cursor-pointer flex items-center gap-3 transition-all duration-150"
                            style={{
                              padding: '11px 16px',
                              fontFamily: 'var(--font-dm)',
                              fontSize: '14px',
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
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>{errors.relationship && <FieldError msg={errors.relationship} />}</AnimatePresence>
              </div>
            </motion.div>

            {/* Field 3: Sender message */}
            <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible" className="mb-5">
              <FloatingLabel>💌 Ujumbe Wako</FloatingLabel>
              <div className="relative">
                <textarea
                  id="message-input"
                  value={senderMessage}
                  onChange={(e) => { setSenderMessage(e.target.value); if (errors.senderMessage) setErrors((p) => ({ ...p, senderMessage: '' })) }}
                  placeholder="Andika ujumbe wako wa moyoni hapa..."
                  className="w-full outline-none transition-all duration-300 resize-none"
                  rows={3}
                  style={{
                    padding: '13px 16px',
                    borderRadius: '12px',
                    border: `2px solid ${errors.senderMessage ? '#E53E3E' : '#E8D5C4'}`,
                    fontFamily: 'var(--font-dm)',
                    fontSize: '15px',
                    color: '#2D2D2D',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  }}
                  onFocus={(e) => {
                    if (!errors.senderMessage) {
                      e.target.style.borderColor = '#FF6B6B'
                      e.target.style.boxShadow = '0 0 0 4px rgba(255,107,107,0.12), 0 4px 12px rgba(255,107,107,0.08)'
                      e.target.style.backgroundColor = '#FFFAF8'
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.senderMessage) {
                      e.target.style.borderColor = '#E8D5C4'
                      e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)'
                      e.target.style.backgroundColor = '#FFFFFF'
                    }
                  }}
                />
              </div>
              <AnimatePresence>{errors.senderMessage && <FieldError msg={errors.senderMessage} />}</AnimatePresence>
            </motion.div>

            {/* Field 4: Image upload */}
            <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible" className="mb-7">
              <FloatingLabel>📷 Pakia Picha</FloatingLabel>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => selectImage(e.target.files?.[0])}
                className="hidden"
                id="image-upload-input"
              />

              <AnimatePresence mode="wait">
                {!imagePreviewUrl ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className="relative cursor-pointer flex flex-col items-center justify-center gap-3 overflow-hidden transition-all duration-300"
                    style={{
                      height: '120px',
                      borderRadius: '16px',
                      border: `2px dashed ${errors.image ? '#E53E3E' : isDragging ? '#FF6B6B' : '#FFB4A2'}`,
                      backgroundColor: isDragging ? 'rgba(255,107,107,0.07)' : '#FFF5F3',
                      boxShadow: isDragging ? '0 0 0 4px rgba(255,107,107,0.1)' : 'none',
                    }}
                    id="image-upload-zone"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {/* Shimmer on hover */}
                    {isDragging && <div className="holo-layer" />}

                    <motion.div
                      animate={isDragging ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                      transition={{ duration: 0.6, repeat: isDragging ? Infinity : 0 }}
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={isDragging ? '#FF6B6B' : '#FFB4A2'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </motion.div>
                    <p style={{ fontFamily: 'var(--font-dm)', fontSize: '13px', color: isDragging ? '#FF6B6B' : '#B08B7A' }}>
                      {isDragging ? 'Achia hapa...' : 'Bonyeza hapa au drag picha yake'}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-4 p-4"
                    style={{
                      borderRadius: '16px',
                      border: '2px solid #FFB4A2',
                      backgroundColor: '#FFF5F3',
                      boxShadow: '0 4px 16px rgba(255,107,107,0.1)',
                    }}
                  >
                    {/* Rotating border avatar */}
                    <div className="relative shrink-0">
                      <motion.div
                        className="absolute rounded-full"
                        style={{
                          inset: '-3px',
                          background: 'conic-gradient(from 0deg, #FF6B6B, #FFE66D, #A8EDEA, #FF6B6B)',
                          borderRadius: '50%',
                          zIndex: 0,
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      />
                      <div className="relative rounded-full overflow-hidden" style={{ width: 64, height: 64, zIndex: 1 }}>
                        <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ fontFamily: 'var(--font-dm)', color: '#2D2D2D' }}>
                        {imageFile?.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#6B6B6B', fontFamily: 'var(--font-dm)' }}>
                        {(imageFile?.size / 1024).toFixed(1)} KB
                      </p>
                      <button
                        onClick={clearImage}
                        className="text-xs mt-1.5 font-semibold cursor-pointer hover:underline"
                        style={{ fontFamily: 'var(--font-dm)', color: '#E53E3E', background: 'none', border: 'none', padding: 0 }}
                      >
                        × Badilisha
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>{errors.image && !imagePreviewUrl && <FieldError msg={errors.image} />}</AnimatePresence>
            </motion.div>

            {/* Generate Button */}
            <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible">
              <motion.button
                onClick={handleGenerate}
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.02, y: -2 } : {}}
                whileTap={!isLoading ? { scale: 0.97 } : {}}
                className="relative w-full flex items-center justify-center gap-2.5 font-semibold overflow-hidden cursor-pointer disabled:cursor-not-allowed"
                style={{
                  height: '54px',
                  borderRadius: '14px',
                  background: isLoading
                    ? 'linear-gradient(135deg, #FFB4A2 0%, #FFD93D 100%)'
                    : 'linear-gradient(135deg, #FF6B6B 0%, #FF9A5C 50%, #FFE66D 100%)',
                  backgroundSize: '200% 100%',
                  border: 'none',
                  fontFamily: 'var(--font-dm)',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  boxShadow: isLoading
                    ? '0 4px 16px rgba(255,107,107,0.2)'
                    : '0 8px 32px rgba(255,107,107,0.35), 0 2px 8px rgba(255,107,107,0.2)',
                  textShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  animation: !isLoading ? 'shimmer 3s linear infinite' : 'none',
                }}
                id="generate-btn"
              >
                {/* Shimmer sweep */}
                {!isLoading && <div className="holo-layer" />}

                {isLoading ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={loadingStepIdx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center gap-2.5"
                    >
                      <motion.svg
                        width="18" height="18" viewBox="0 0 24 24" fill="none"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                      >
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.35)" strokeWidth="3" fill="none" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
                      </motion.svg>
                      <span>{LOADING_STEPS[loadingStepIdx].icon} {LOADING_STEPS[loadingStepIdx].text}</span>
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <>
                    <motion.span
                      animate={{ rotate: [0, 15, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                      style={{ display: 'inline-block', fontSize: '20px' }}
                    >
                      ✨
                    </motion.span>
                    <span>Generate Birthday Wishes</span>
                  </>
                )}
              </motion.button>

              {/* Progress bar during loading */}
              {isLoading && (
                <motion.div
                  className="mt-3 rounded-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ height: '3px', backgroundColor: 'rgba(255,107,107,0.12)' }}
                >
                  <motion.div
                    style={{ height: '100%', background: 'linear-gradient(90deg, #FF6B6B, #FFE66D)', borderRadius: '4px' }}
                    initial={{ width: '5%' }}
                    animate={{ width: loadingStepIdx === 0 ? '30%' : loadingStepIdx === 1 ? '65%' : '90%' }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                  />
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        ) : (
          /* ========================
             SUCCESS STATE
             ======================== */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center py-2"
          >
            {/* Animated checkmark with rings */}
            <div className="relative mb-6">
              {[1, 2].map((r) => (
                <motion.div
                  key={r}
                  className="absolute rounded-full"
                  style={{
                    inset: `-${r * 12}px`,
                    border: `2px solid rgba(56,161,105,${0.3 - r * 0.1})`,
                    borderRadius: '50%',
                  }}
                  animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.2, 0.6] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: r * 0.3 }}
                />
              ))}
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.15 }}
                className="relative w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #38A169 0%, #68D391 100%)',
                  boxShadow: '0 12px 40px rgba(56,161,105,0.4), 0 4px 16px rgba(56,161,105,0.2)',
                }}
              >
                <motion.svg
                  width="34" height="34" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
                >
                  <motion.polyline points="20 6 9 17 4 12" />
                </motion.svg>
              </motion.div>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-2xl font-bold mb-1.5"
              style={{ fontFamily: 'var(--font-playfair)', color: '#2D2D2D' }}
            >
              🎉 Imefanikiwa!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="text-sm mb-6"
              style={{ fontFamily: 'var(--font-dm)', color: '#6B6B6B' }}
            >
              Link yako ya birthday wishes iko tayari kushared!
            </motion.p>

            {/* URL display */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="w-full mb-4 relative"
            >
              <input
                id="share-url-input"
                type="text"
                readOnly
                value={shareUrl}
                onClick={(e) => e.target.select()}
                className="w-full text-center text-xs outline-none cursor-pointer"
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid #E8D5C4',
                  backgroundColor: '#FFF9F0',
                  fontFamily: 'var(--font-dm)',
                  color: '#2D2D2D',
                  fontWeight: 500,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              />
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="flex gap-3 w-full mb-5"
            >
              <motion.button
                onClick={handleCopy}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center justify-center gap-2 font-semibold text-sm cursor-pointer transition-all duration-300"
                style={{
                  padding: '13px 16px',
                  borderRadius: '12px',
                  border: '2px solid #FF6B6B',
                  backgroundColor: copied ? '#FF6B6B' : 'transparent',
                  color: copied ? '#FFFFFF' : '#FF6B6B',
                  fontFamily: 'var(--font-dm)',
                  boxShadow: copied ? '0 6px 20px rgba(255,107,107,0.3)' : 'none',
                }}
                id="copy-link-btn"
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={copied ? 'copied' : 'copy'}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {copied ? '✓ Imenakiliwa!' : '📋 Copy Link'}
                  </motion.span>
                </AnimatePresence>
              </motion.button>

              <motion.a
                href={`https://wa.me/?text=${encodeURIComponent('Angalia birthday wishes zako! ' + shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center justify-center gap-2 font-semibold text-sm no-underline"
                style={{
                  padding: '13px 16px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #25D366, #1DA851)',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-dm)',
                  boxShadow: '0 6px 20px rgba(37,211,102,0.3)',
                }}
                id="share-whatsapp-btn"
              >
                📲 Share
              </motion.a>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.03 }}
              onClick={handleReset}
              className="text-sm font-medium cursor-pointer"
              style={{
                fontFamily: 'var(--font-dm)',
                color: '#FF6B6B',
                background: 'none',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '8px',
              }}
              id="create-new-btn"
            >
              + Tengeneza nyingine
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
