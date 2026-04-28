import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import WishForm from '../components/WishForm'

export default function HomePage() {
  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: '#FFF9F0' }}>
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        className="text-center px-6 pt-6 pb-8 md:pt-10 md:pb-10"
      >
        <h1
          className="text-3xl md:text-[2.8rem] md:leading-[1.2] font-bold mb-3"
          style={{ fontFamily: 'var(--font-playfair)', color: '#2D2D2D' }}
        >
          Tengeneza Birthday Wish{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #FF6B6B, #FFE66D)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Maalum
          </span>
        </h1>
        <p
          className="text-base md:text-lg max-w-md mx-auto"
          style={{ fontFamily: 'var(--font-dm)', color: '#6B6B6B' }}
        >
          Mfurahishe mtu unayempenda kwa njia ya kipekee ✨
        </p>
      </motion.div>

      {/* Form Card */}
      <div className="px-4 md:px-6 max-w-[560px] mx-auto">
        <WishForm />
      </div>

      {/* Floating decorative elements */}
      <div className="fixed pointer-events-none inset-0 overflow-hidden z-0">
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute opacity-[0.06]"
          style={{ top: '15%', left: '8%', fontSize: '48px' }}
        >
          🎈
        </motion.div>
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute opacity-[0.06]"
          style={{ top: '30%', right: '10%', fontSize: '40px' }}
        >
          🎁
        </motion.div>
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute opacity-[0.06]"
          style={{ bottom: '25%', left: '12%', fontSize: '36px' }}
        >
          🎉
        </motion.div>
        <motion.div
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute opacity-[0.06]"
          style={{ bottom: '15%', right: '8%', fontSize: '44px' }}
        >
          🎂
        </motion.div>
      </div>
    </div>
  )
}
