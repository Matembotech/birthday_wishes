import { motion } from 'framer-motion'

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full py-4 px-4 sm:px-6 md:px-8"
    >
      <div className="max-w-[580px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <motion.div
            animate={{ rotate: [0, 12, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
            className="relative"
          >
            {/* Glow behind icon */}
            <div
              className="absolute inset-0 rounded-full blur-md"
              style={{ background: 'rgba(255,107,107,0.3)', transform: 'scale(1.4)' }}
            />
            <span className="relative text-2xl leading-none">🎂</span>
          </motion.div>
          <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-dm)' }}>
            <span style={{ color: '#2D2D2D' }}>Birthday</span>
            <span
              style={{
                marginLeft: '4px',
                background: 'linear-gradient(135deg, #FF6B6B, #FF9A5C)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Wishes
            </span>
          </span>
        </div>

        {/* Right — subtle AI badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full"
          style={{
            background: 'rgba(255,107,107,0.08)',
            border: '1px solid rgba(255,107,107,0.18)',
          }}
        >
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: '#FF6B6B' }}
          />
          <span style={{ fontFamily: 'var(--font-dm)', fontSize: '11px', fontWeight: 600, color: '#FF6B6B' }}>
            AI Powered
          </span>
        </motion.div>
      </div>
    </motion.nav>
  )
}
