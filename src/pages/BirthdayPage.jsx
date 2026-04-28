import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

/* Stable particle config */
const PARTICLES = Array.from({ length: 35 }, (_, i) => ({
  id: i,
  size: (i % 4) * 1.5 + 2,
  color: ['#FF6B6B', '#FFE66D', '#A8EDEA', '#FFB4A2', '#ffffff', '#FF9A5C'][i % 6],
  top: ((i * 41 + 11) % 100),
  left: ((i * 67 + 19) % 100),
  duration: 7 + (i % 6) * 1.2,
  delay: (i * 0.3) % 6,
  drift: ((i % 9) - 4) * 30,
}))

const CONFETTI = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  color: ['#FF6B6B', '#FFE66D', '#A8EDEA', '#FFB4A2', '#ffffff'][i % 5],
  left: ((i * 57 + 13) % 95) + 2,
  duration: 3.5 + (i % 4) * 0.8,
  delay: i * 0.25,
  width: (i % 3) * 4 + 6,
  height: (i % 2) * 4 + 8,
  rotate: (i * 47) % 360,
}))

const MSG_ICONS = ['🌟', '💫', '✨']
const MSG_COLORS = [
  { border: 'rgba(255,107,107,0.25)', glow: 'rgba(255,107,107,0.08)', accent: '#FF6B6B' },
  { border: 'rgba(255,230,109,0.3)', glow: 'rgba(255,230,109,0.1)', accent: '#FFD93D' },
  { border: 'rgba(168,237,234,0.3)', glow: 'rgba(168,237,234,0.1)', accent: '#4ECDC4' },
]

function PhotoCard({ src, alt }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { stiffness: 150, damping: 25 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { stiffness: 150, damping: 25 })

  const onMove = (e) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 800 }}
      className="relative"
    >
      {/* Pulsing rings */}
      {[1, 2, 3].map((ring) => (
        <motion.div
          key={ring}
          className="absolute inset-0 rounded-full"
          style={{
            border: `2px solid rgba(255,107,107,${0.4 - ring * 0.1})`,
            margin: `-${ring * 10}px`,
            borderRadius: '50%',
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: ring * 0.3 }}
        />
      ))}

      {/* Rotating gradient halo */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: '-12px',
          background: 'conic-gradient(from 0deg, #FF6B6B, #FFE66D, #A8EDEA, #FFB4A2, #FF6B6B)',
          borderRadius: '50%',
          zIndex: -1,
          filter: 'blur(8px)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />

      {/* Inner white ring */}
      <div
        className="absolute rounded-full"
        style={{ inset: '-5px', background: 'white', borderRadius: '50%', zIndex: 0 }}
      />

      {/* Photo */}
      <div
        className="relative rounded-full overflow-hidden"
        style={{
          width: '140px',
          height: '140px',
          zIndex: 1,
          boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 3px rgba(255,255,255,0.15)',
        }}
      >
        <img src={src} alt={alt} className="w-full h-full object-cover" />
        {/* Shine overlay */}
        <div
          className="absolute inset-0 holo-layer"
          style={{ borderRadius: '50%' }}
        />
      </div>

      {/* 3D floating star */}
      <motion.div
        className="absolute text-xl"
        style={{ top: '-8px', right: '-8px', transformStyle: 'preserve-3d', translateZ: '20px' }}
        animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        ✨
      </motion.div>
    </motion.div>
  )
}

function MessageCard({ msg, idx, variants }) {
  const c = MSG_COLORS[idx]
  return (
    <motion.div
      variants={variants}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative overflow-hidden text-left"
      style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)`,
        border: `1px solid ${c.border}`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '1.5rem',
        boxShadow: `0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)`,
      }}
    >
      {/* Glow background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at top left, ${c.glow}, transparent 60%)`,
          pointerEvents: 'none',
          borderRadius: 'inherit',
        }}
      />

      {/* Accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '3px',
          height: '100%',
          background: `linear-gradient(180deg, ${c.accent}, transparent)`,
          borderRadius: '20px 0 0 20px',
        }}
      />

      {/* Shimmer */}
      <div className="holo-layer" />

      {/* Icon */}
      <motion.div
        className="absolute top-3 right-4 text-2xl opacity-25"
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.8 }}
      >
        {MSG_ICONS[idx]}
      </motion.div>

      <span
        className="absolute top-3 left-5 text-5xl opacity-10 leading-none"
        style={{ fontFamily: 'var(--font-playfair)', color: c.accent }}
      >
        "
      </span>

      <p
        className="relative z-10 leading-relaxed"
        style={{
          fontFamily: 'var(--font-dm)',
          fontSize: 'clamp(15px, 2.5vw, 18px)',
          color: 'rgba(255,255,255,0.92)',
          textShadow: '0 1px 3px rgba(0,0,0,0.3)',
          paddingLeft: '4px',
        }}
      >
        {msg}
      </p>
    </motion.div>
  )
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.25, delayChildren: 2.2 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.93, rotateX: -8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function BirthdayPage() {
  const { id } = useParams()
  const [wish, setWish] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [curtainDone, setCurtainDone] = useState(false)

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
        setError('Samahani, tumeshindwa kupata ukurasa huu.')
      } finally {
        setLoading(false)
      }
    }
    fetchWish()
  }, [id])

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6"
        style={{ background: 'linear-gradient(135deg, #0D0D1A 0%, #1A1A2E 50%, #0F2040 100%)' }}
      >
        {/* Orbital loader */}
        <div className="relative w-20 h-20">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: '3px solid rgba(255,107,107,0.15)' }}
          />
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: '3px solid transparent', borderTopColor: '#FF6B6B' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{ inset: '8px', border: '2px solid transparent', borderTopColor: '#FFE66D' }}
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xl">🎂</div>
        </div>
        <p style={{ fontFamily: 'var(--font-dancing)', fontSize: '20px', color: 'rgba(255,230,109,0.8)' }}>
          Inafungua...
        </p>
      </div>
    )
  }

  if (error || !wish) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
        style={{ background: 'linear-gradient(135deg, #0D0D1A 0%, #1A1A2E 50%, #0F2040 100%)' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-6xl mb-5"
        >
          🎂😥
        </motion.div>
        <h1 className="text-xl text-white font-bold mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
          {error || 'Not Found'}
        </h1>
        <Link
          to="/"
          className="px-6 py-2.5 rounded-full font-medium transition-all duration-300"
          style={{
            fontFamily: 'var(--font-dm)',
            background: 'linear-gradient(135deg, #FF6B6B, #FFE66D)',
            color: '#fff',
            textDecoration: 'none',
            boxShadow: '0 8px 24px rgba(255,107,107,0.4)',
          }}
        >
          Rudi Mwanzo
        </Link>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen overflow-x-hidden relative"
      style={{ background: 'linear-gradient(160deg, #0D0D1A 0%, #1A1A2E 45%, #0F2040 100%)' }}
    >
      {/* Curtain reveal */}
      <AnimatePresence>
        {!curtainDone && (
          <motion.div
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            exit={{}}
            transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1], delay: 0.4 }}
            onAnimationComplete={() => setCurtainDone(true)}
            className="fixed inset-0 z-[100] flex items-center justify-center origin-top"
            style={{ background: 'linear-gradient(160deg, #0D0D1A 0%, #1A1A2E 60%, #0F2040 100%)' }}
          >
            <motion.div
              animate={{ scale: [0.7, 1.3, 0.7], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-6xl"
            >
              ✨
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Aurora background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          className="absolute"
          style={{
            top: '-20%',
            left: '-10%',
            width: '70%',
            height: '60%',
            background: 'radial-gradient(ellipse, rgba(255,107,107,0.12) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute"
          style={{
            bottom: '-20%',
            right: '-10%',
            width: '60%',
            height: '60%',
            background: 'radial-gradient(ellipse, rgba(168,237,234,0.08) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />
        <motion.div
          className="absolute top-1/3 left-1/3"
          style={{
            width: '40%',
            height: '40%',
            background: 'radial-gradient(ellipse, rgba(255,230,109,0.06) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              top: `${p.top}%`,
              left: `${p.left}%`,
            }}
            animate={{
              y: [0, -140, 0],
              x: [0, p.drift, 0],
              opacity: [0, 0.75, 0],
              scale: [0.4, 1.1, 0.4],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Confetti burst on load */}
      {curtainDone && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-[5]">
          {CONFETTI.map((c) => (
            <motion.div
              key={c.id}
              className="absolute"
              style={{
                left: `${c.left}%`,
                top: '-10px',
                width: `${c.width}px`,
                height: `${c.height}px`,
                backgroundColor: c.color,
                borderRadius: c.id % 3 === 0 ? '50%' : '2px',
                rotate: `${c.rotate}deg`,
              }}
              initial={{ y: -20, opacity: 1 }}
              animate={{ y: '110vh', opacity: 0, rotate: `${c.rotate + 720}deg` }}
              transition={{ duration: c.duration, ease: 'easeIn', delay: c.delay }}
            />
          ))}
        </div>
      )}

      {/* Star field */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {Array.from({ length: 40 }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: (i % 3) + 1 + 'px',
              height: (i % 3) + 1 + 'px',
              backgroundColor: 'white',
              top: `${(i * 37 + 5) % 100}%`,
              left: `${(i * 73 + 11) % 100}%`,
              animation: `star-twinkle ${2 + (i % 4)}s ease-in-out infinite`,
              animationDelay: `${(i * 0.2) % 4}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-[660px] mx-auto px-4 sm:px-6 pt-14 pb-24 flex flex-col items-center text-center">

        {/* Happy Birthday Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
          className="mb-10"
        >
          <h2
            className="text-4xl sm:text-5xl md:text-6xl"
            style={{
              fontFamily: 'var(--font-dancing)',
              color: '#FFE66D',
              textShadow: '0 0 30px rgba(255,230,109,0.5), 0 0 60px rgba(255,230,109,0.2)',
              lineHeight: 1.2,
            }}
          >
            ✨ Happy Birthday ✨
          </h2>
          {/* Underline glow */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="mx-auto mt-2"
            style={{
              height: '2px',
              width: '180px',
              background: 'linear-gradient(90deg, transparent, #FFE66D, transparent)',
              borderRadius: '1px',
            }}
          />
        </motion.div>

        {/* Profile Photo with 3D */}
        <motion.div
          initial={{ scale: 0, opacity: 0, rotateY: -90 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{ type: 'spring', stiffness: 150, damping: 18, delay: 1.0 }}
          className="mb-8"
          style={{ perspective: 800 }}
        >
          <PhotoCard src={wish.image_url} alt={wish.name} />
        </motion.div>

        {/* Name with 3D text effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="mb-2"
        >
          <h1
            className="font-bold leading-tight"
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(32px, 7vw, 56px)',
              color: '#FFFFFF',
              textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(255,107,107,0.2)',
            }}
          >
            🎂 {wish.name} 🎂
          </h1>
        </motion.div>

        {/* Relationship badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.6, type: 'spring' }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-10"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <span style={{ fontFamily: 'var(--font-dm)', fontSize: '14px', color: 'rgba(255,255,255,0.75)' }}>
            {wish.relationship}
          </span>
        </motion.div>

        {/* Sender message */}
        {wish.sender_message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1.7, duration: 0.8, type: 'spring', stiffness: 120 }}
            className="relative mb-12 w-full max-w-lg mx-auto overflow-hidden"
            style={{
              padding: '1.5rem 2rem',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,180,162,0.3)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <div className="holo-layer" />
            <motion.span
              className="absolute top-2 left-4 opacity-20"
              style={{ fontFamily: 'var(--font-playfair)', fontSize: '64px', color: '#FFB4A2', lineHeight: 1 }}
              animate={{ opacity: [0.15, 0.3, 0.15] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              "
            </motion.span>
            <p
              style={{
                fontFamily: 'var(--font-dancing)',
                fontSize: 'clamp(20px, 4vw, 28px)',
                color: '#FFB4A2',
                textShadow: '0 2px 12px rgba(0,0,0,0.4)',
                lineHeight: 1.5,
                position: 'relative',
                zIndex: 1,
              }}
            >
              "{wish.sender_message}"
            </p>
          </motion.div>
        )}

        {/* AI Message Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full flex flex-col gap-4"
          style={{ perspective: 1000 }}
        >
          {[wish.message_1, wish.message_2, wish.message_3].map((msg, idx) =>
            msg ? <MessageCard key={idx} msg={msg} idx={idx} variants={cardVariants} /> : null
          )}
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4, duration: 0.8 }}
          className="mt-16"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold transition-all duration-300"
            style={{
              fontFamily: 'var(--font-dm)',
              fontSize: '14px',
              background: 'linear-gradient(135deg, rgba(255,107,107,0.2), rgba(255,230,109,0.15))',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(10px)',
              textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,107,107,0.35), rgba(255,230,109,0.25))'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(255,107,107,0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,107,107,0.2), rgba(255,230,109,0.15))'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'
            }}
          >
            🎁 Tengeneza yako pia
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
