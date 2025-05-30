import React from 'react'

interface ImageModalProps {
  imageUrl: string | null
  onClose: () => void
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null
  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70'
      onClick={onClose}
    >
      <div
        className='relative max-w-full max-h-full'
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className='absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100'
          onClick={onClose}
          aria-label='Cerrar'
        >
          <span className='text-xl'>×</span>
        </button>
        <img
          src={imageUrl}
          alt='Vista ampliada'
          className='max-h-[80vh] max-w-[90vw] rounded shadow-lg border bg-white'
        />
      </div>
    </div>
  )
}

export default ImageModal
