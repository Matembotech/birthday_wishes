import { useState } from 'react'
import { motion } from 'framer-motion'

export default function SuccessCard({ shareUrl, onReset }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const input = document.getElementById('share-url-input')
      input?.select()
      document.execCommand('copy')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`🎂 Nimekutengenezea birthday wishes maalum! Fungua hii link: ${shareUrl}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center text-center"
    >
      {/* Success checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
        className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
        style={{
          background: 'linear-gradient(135deg, #38A169, #68D391)',
          boxShadow: '0 8px 30px rgba(56, 161, 105, 0.3)',
        }}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </motion.div>

      {/* Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="text-2xl font-bold mb-2"
        style={{ fontFamily: 'var(--font-playfair)', color: '#2D2D2D' }}
      >
        🎉 Imefanikiwa!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="text-sm mb-6"
        style={{ fontFamily: 'var(--font-dm)', color: '#6B6B6B' }}
      >
        Link yako ya birthday wishes iko tayari
      </motion.p>

      {/* Share URL input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="w-full mb-5"
      >
        <input
          id="share-url-input"
          type="text"
          readOnly
          value={shareUrl}
          className="w-full text-center text-sm outline-none"
          style={{
            padding: '14px 18px',
            borderRadius: '12px',
            border: '2px solid #E8D5C4',
            backgroundColor: '#FFF9F0',
            fontFamily: 'var(--font-dm)',
            color: '#2D2D2D',
            fontWeight: 500,
          }}
          onClick={(e) => e.target.select()}
        />
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="flex gap-3 w-full mb-6"
      >
        {/* Copy Link */}
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
          onMouseEnter={(e) => {
            if (!copied) {
              e.currentTarget.style.backgroundColor = '#FFF0ED'
            }
          }}
          onMouseLeave={(e) => {
            if (!copied) {
              e.currentTarget.style.backgroundColor = 'transparent'
            }
          }}
          id="copy-link-btn"
        >
          <span>{copied ? '✅' : '📋'}</span>
          {copied ? 'Imecopy!' : 'Copy Link'}
        </button>

        {/* Share WhatsApp */}
        <button
          onClick={handleWhatsAppShare}
          className="flex-1 flex items-center justify-center gap-2 font-semibold text-sm cursor-pointer transition-all duration-300"
          style={{
            padding: '14px 20px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: '#25D366',
            color: '#FFFFFF',
            fontFamily: 'var(--font-dm)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#20BD5A'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#25D366'
          }}
          id="share-whatsapp-btn"
        >
          <span>📲</span>
          Share WhatsApp
        </button>
      </motion.div>

      {/* Reset link */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        onClick={onReset}
        className="text-sm font-medium cursor-pointer transition-colors duration-200"
        style={{
          fontFamily: 'var(--font-dm)',
          color: '#FF6B6B',
          background: 'none',
          border: 'none',
          padding: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.textDecoration = 'underline'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.textDecoration = 'none'
        }}
        id="create-new-btn"
      >
        + Tengeneza Nyingine
      </motion.button>
    </motion.div>
  )
}
