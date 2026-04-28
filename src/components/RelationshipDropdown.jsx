import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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

export default function RelationshipDropdown({ value, onChange, error }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const selected = RELATIONSHIPS.find((r) => r.value === value)

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative" id="relationship-dropdown">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left cursor-pointer transition-all duration-300 outline-none"
        style={{
          padding: '14px 18px',
          paddingRight: '44px',
          borderRadius: '12px',
          border: `2px solid ${error ? '#E53E3E' : isOpen ? '#FF6B6B' : '#E8D5C4'}`,
          backgroundColor: '#FFFFFF',
          fontFamily: 'var(--font-dm)',
          fontSize: '16px',
          color: selected ? '#2D2D2D' : '#A89585',
          boxShadow: isOpen ? '0 0 0 4px rgba(255, 107, 107, 0.15)' : 'none',
        }}
      >
        {selected ? (
          <span>
            <span className="mr-2">{selected.emoji}</span>
            {selected.label}
          </span>
        ) : (
          'Chagua relationship...'
        )}

        {/* Chevron */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6B6B6B"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute right-4 top-1/2 transition-transform duration-300"
          style={{
            transform: `translateY(-50%) rotate(${isOpen ? '180deg' : '0deg'})`,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
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
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(255, 107, 107, 0.06)',
            }}
          >
            <div className="py-1.5 max-h-[280px] overflow-y-auto">
              {RELATIONSHIPS.map((rel) => (
                <button
                  key={rel.value}
                  type="button"
                  onClick={() => {
                    onChange(rel.value)
                    setIsOpen(false)
                  }}
                  className="w-full text-left cursor-pointer transition-all duration-200 flex items-center gap-3 relative"
                  style={{
                    padding: '12px 18px',
                    paddingLeft: rel.value === value ? '18px' : '18px',
                    fontFamily: 'var(--font-dm)',
                    fontSize: '15px',
                    color: '#2D2D2D',
                    backgroundColor: rel.value === value ? '#FFF0ED' : 'transparent',
                    borderLeft: rel.value === value ? '3px solid #FF6B6B' : '3px solid transparent',
                    border: 'none',
                    borderLeftWidth: '3px',
                    borderLeftStyle: 'solid',
                    borderLeftColor: rel.value === value ? '#FF6B6B' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (rel.value !== value) {
                      e.currentTarget.style.backgroundColor = '#FFF5F3'
                      e.currentTarget.style.borderLeftColor = '#FFB4A2'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (rel.value !== value) {
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

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs mt-1.5 ml-1"
          style={{ fontFamily: 'var(--font-dm)', color: '#E53E3E' }}
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
