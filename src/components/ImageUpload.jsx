import { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ImageUpload({ image, onImageSelect, onImageRemove, error }) {
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file)
    }
  }

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file)
    }
  }, [onImageSelect])

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="image-upload-input"
      />

      <AnimatePresence mode="wait">
        {!image ? (
          /* Empty upload zone */
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="relative cursor-pointer rounded-2xl transition-all duration-300"
            style={{
              height: '130px',
              border: `2px dashed ${isDragging ? '#FF6B6B' : error ? '#E53E3E' : '#FFB4A2'}`,
              backgroundColor: isDragging ? 'rgba(255, 107, 107, 0.06)' : '#FFF5F3',
            }}
            id="image-upload-zone"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5">
              {/* Camera SVG Icon */}
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isDragging ? '#FF6B6B' : '#FFB4A2'}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-colors duration-300"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <p
                className="text-sm text-center px-4"
                style={{
                  fontFamily: 'var(--font-dm)',
                  color: isDragging ? '#FF6B6B' : '#B08B7A',
                }}
              >
                {isDragging ? 'Achia picha hapa...' : 'Bonyeza hapa au drag picha yake'}
              </p>
            </div>
          </motion.div>
        ) : (
          /* Image preview */
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-4 p-4 rounded-2xl"
            style={{
              backgroundColor: '#FFF5F3',
              border: '2px solid #FFB4A2',
            }}
            id="image-preview"
          >
            {/* Circular thumbnail */}
            <div
              className="shrink-0 rounded-full overflow-hidden"
              style={{
                width: '72px',
                height: '72px',
                border: '3px solid #FF6B6B',
              }}
            >
              <img
                src={image.preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Filename + remove */}
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium truncate"
                style={{ fontFamily: 'var(--font-dm)', color: '#2D2D2D' }}
              >
                {image.file.name}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ fontFamily: 'var(--font-dm)', color: '#6B6B6B' }}
              >
                {(image.file.size / 1024).toFixed(1)} KB
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onImageRemove()
                }}
                className="text-xs mt-1.5 font-medium cursor-pointer transition-colors duration-200 hover:underline"
                style={{
                  fontFamily: 'var(--font-dm)',
                  color: '#E53E3E',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                }}
                id="remove-image-btn"
              >
                × Remove
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && !image && (
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
