import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

/* ---- Animation Variants ---- */
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.3 }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } }
}

const photoVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 200, damping: 15 }
  }
}

export default function BirthdayPage() {
  const { id } = useParams()
  const [wish, setWish] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchWish() {
      try {
        const { data, error } = await supabase
          .from('wishes')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        if (!data) throw new Error('Wish not found')
        
        setWish(data)
      } catch (err) {
        console.error(err)
        setError('Samahani, tumeshindwa kupata ukurasa huu. 🎂')
      } finally {
        setLoading(false)
      }
    }

    fetchWish()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-10 h-10 border-4 border-t-transparent border-[#FF6B6B] rounded-full"></motion.div>
      </div>
    )
  }

  if (error || !wish) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)' }}>
        <span className="text-6xl mb-4">🎂😥</span>
        <h1 className="text-2xl text-white font-bold mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>{error || 'Not Found'}</h1>
        <Link to="/" className="text-[#FF6B6B] hover:underline" style={{ fontFamily: 'var(--font-dm)' }}>Rudi Mwanzo</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)' }}>
      
      {/* Floating Particles Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              backgroundColor: ['#FF6B6B', '#FFE66D', '#A8EDEA', '#FFFFFF'][Math.floor(Math.random() * 4)],
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5 + 0.2
            }}
            animate={{
              y: [0, -100 - Math.random() * 100],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      <div className="max-w-[600px] mx-auto px-6 pt-16 pb-24 relative z-10 flex flex-col items-center text-center">
        
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-4xl md:text-5xl mb-10"
          style={{ fontFamily: 'var(--font-dancing)', color: '#FFE66D', textShadow: '0 0 20px rgba(255,230,109,0.3)' }}
        >
          ✨ Happy Birthday ✨
        </motion.h2>

        {/* Profile Photo */}
        <motion.div
          variants={photoVariants}
          initial="hidden"
          animate="visible"
          className="relative mb-6"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-[-8px] rounded-full blur-md"
            style={{ background: 'linear-gradient(135deg, #FF6B6B, #FFE66D, #A8EDEA)', zIndex: -1 }}
          />
          <div className="w-[150px] h-[150px] md:w-[200px] md:h-[200px] rounded-full overflow-hidden border-4 border-white" style={{ boxShadow: '0 0 40px rgba(255, 107, 107, 0.4)' }}>
            <img src={wish.image_url} alt={wish.name} className="w-full h-full object-cover" />
          </div>
        </motion.div>

        {/* Name & Relationship */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-[40px] md:text-[52px] font-bold mb-1 leading-tight"
          style={{ fontFamily: 'var(--font-playfair)', color: '#FFFFFF' }}
        >
          🎂 {wish.name} 🎂
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-lg md:text-xl mb-12"
          style={{ fontFamily: 'var(--font-dm)', color: 'rgba(255,255,255,0.7)' }}
        >
          {wish.relationship}
        </motion.p>

        {/* Message Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full flex flex-col gap-5"
        >
          {[wish.message_1, wish.message_2, wish.message_3].map((msg, idx) => (
            msg && (
              <motion.div
                key={idx}
                variants={cardVariants}
                className="relative p-6 md:p-8 text-left overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderRadius: '24px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                }}
              >
                {/* Decorative Quote Mark */}
                <span className="absolute top-4 left-4 text-5xl opacity-10" style={{ fontFamily: 'var(--font-playfair)', color: '#FF6B6B', lineHeight: 1 }}>"</span>
                
                <p className="relative z-10 text-[17px] md:text-[19px] leading-relaxed" style={{ fontFamily: 'var(--font-dm)', color: '#FFFFFF', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                  {msg}
                </p>
              </motion.div>
            )
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 2, duration: 1 }}
          className="mt-16"
        >
           <Link to="/" className="text-sm px-6 py-3 rounded-full border border-[rgba(255,255,255,0.2)] text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors" style={{ fontFamily: 'var(--font-dm)' }}>
             🎁 Tengeneza yako pia
           </Link>
        </motion.div>
      </div>
    </div>
  )
}
