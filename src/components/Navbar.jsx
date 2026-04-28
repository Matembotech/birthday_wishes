import { motion } from 'framer-motion'

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full py-4 px-6 md:px-8"
    >
      <div className="max-w-[560px] mx-auto flex items-center">
        <span className="text-lg font-semibold tracking-tight" style={{ fontFamily: 'var(--font-dm)' }}>
          <span className="text-2xl mr-1.5">🎂</span>
          <span className="text-text-primary">Birthday</span>
          <span className="text-coral ml-1">Wishes</span>
        </span>
      </div>
    </motion.nav>
  )
}
