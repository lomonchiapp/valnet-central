import React, { useState, useEffect, useRef } from 'react'
import { WallNetPriority } from '@/types/interfaces/valnet/wallNet'
import {
  ArrowUp,
  AlertCircle,
  Star,
  Flame,
  ChevronDown,
  Image as ImageIcon,
  Mic,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useWallNetStore } from '@/stores/wallNetStore'
import { useWallNetPosts } from './hooks/useWallNetPosts'

const VALNET_BLUE = '#0053A0'
const VALNET_ORANGE = '#F37021'

const PRIORITY_OPTIONS: {
  value: WallNetPriority
  label: string
  color: string
  icon: React.ReactNode
}[] = [
  {
    value: 'normal',
    label: 'Normal',
    color: VALNET_BLUE,
    icon: <Star className='w-4 h-4' />,
  },
  {
    value: 'importante',
    label: 'Importante',
    color: '#eab308',
    icon: <AlertCircle className='w-4 h-4' />,
  },
  {
    value: 'urgente',
    label: 'Urgente',
    color: VALNET_ORANGE,
    icon: <Flame className='w-4 h-4' />,
  },
]

// Utilidad para comprimir imagen a JPEG de baja calidad
async function compressImage(
  file: File,
  maxWidth = 600,
  maxHeight = 600,
  quality = 0.5
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      let { width, height } = img
      if (width > maxWidth || height > maxHeight) {
        const aspect = width / height
        if (width > height) {
          width = maxWidth
          height = Math.round(maxWidth / aspect)
        } else {
          height = maxHeight
          width = Math.round(maxHeight * aspect)
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('No se pudo comprimir la imagen'))
        },
        'image/jpeg',
        quality
      )
    }
    img.onerror = reject
    img.src = url
  })
}

const WallNetPostForm = () => {
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [priority, setPriority] = useState<WallNetPriority>('normal')
  const [showPriority, setShowPriority] = useState(false)
  const [showCategory, setShowCategory] = useState(false)
  const [showPopover, setShowPopover] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [recordingUrl, setRecordingUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const { postMessage, uploadImage, uploadAudio } = useWallNetPosts()
  const categories = useWallNetStore((s) => s.categories)
  const { user } = useAuthStore()
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id)
    }
  }, [categories, categoryId])

  const handleSubmit = async (e: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault?.()
    if (!user || !categoryId) return
    const category = categories.find((c) => c.id === categoryId)
    if (!category) return
    setUploading(true)
    const finalImageUrl = imageUrl
    let finalAudioUrl = ''
    // Si hay audio, subirlo
    if (audioBlob) {
      finalAudioUrl = await uploadAudio(audioBlob)
    }
    await postMessage(
      {
        content,
        imageUrl: finalImageUrl,
        audioUrl: finalAudioUrl,
        categoryId,
        priority,
      },
      { id: user.id, name: `${user.nombres} ${user.apellidos}` },
      category
    )
    setContent('')
    setImageUrl('')
    setAudioBlob(null)
    setRecordingUrl('')
    setCategoryId(categories[0]?.id || '')
    setPriority('normal')
    setUploading(false)
  }

  // Long press logic
  const handleSendMouseDown = () => {
    longPressTimeout.current = setTimeout(() => {
      setShowPopover(true)
    }, 2000)
  }
  const handleSendMouseUp = (
    e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>
  ) => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current)
      longPressTimeout.current = null
    }
    if (!showPopover) {
      handleSubmit(
        e as
          | React.MouseEvent<HTMLButtonElement>
          | React.TouchEvent<HTMLButtonElement>
      )
    }
  }
  const handleSendMouseLeave = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current)
      longPressTimeout.current = null
    }
  }

  // Imagen
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file)
    const url = await uploadImage(compressed)
    setImageUrl(url)
    setShowPopover(false)
  }

  // Audio
  const handleStartRecording = async () => {
    setIsRecording(true)
    audioChunks.current = []
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new window.MediaRecorder(stream)
    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.ondataavailable = (e) => {
      audioChunks.current.push(e.data)
    }
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks.current, { type: 'audio/webm' })
      setAudioBlob(blob)
      setRecordingUrl(URL.createObjectURL(blob))
      setIsRecording(false)
      setShowPopover(false)
    }
    mediaRecorder.start()
  }
  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop()
  }

  const currentPriority = PRIORITY_OPTIONS.find((p) => p.value === priority)
  const currentCategory = categories.find((c) => c.id === categoryId)

  // No renderizar si no hay usuario autenticado
  if (!user) {
    return null
  }

  return (
    <form onSubmit={handleSubmit} className='flex gap-3 items-start relative'>
      {/* Avatar */}
      <div className='flex-shrink-0 absolute -left-7 top-3'>
        <div
          className='w-10 h-10 rounded-full'
          style={{
            background: VALNET_BLUE,
            color: '#fff',
            border: '2px solid #fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: 20,
          }}
        >
          {user?.nombres?.[0] || '?'}
        </div>
      </div>
      {/* Formulario */}
      <div className='flex-1 flex gap-2 items-center bg-white rounded-xl border shadow px-3 py-2'>
        <textarea
          placeholder='¿Qué quieres compartir?'
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className='w-full border-none outline-none resize-none bg-transparent text-base min-h-[40px] max-h-32 p-0 placeholder:text-gray-400'
          rows={2}
          maxLength={300}
          required
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e)
          }}
        />
        {/* Selector visual de categoría */}
        <div className='relative'>
          <button
            type='button'
            className='flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold border-2 hover:bg-blue-50 transition'
            style={{
              background: currentCategory?.color + '22',
              color: currentCategory?.color,
              borderColor: currentCategory?.color || VALNET_BLUE,
            }}
            onClick={() => setShowCategory((v) => !v)}
            title={currentCategory?.name}
          >
            <span className='truncate max-w-[80px]'>
              {currentCategory?.name || 'Categoría'}
            </span>
            <ChevronDown className='w-4 h-4' />
          </button>
          {showCategory && (
            <div className='absolute z-30 bg-white border rounded shadow-md mt-2 right-0 min-w-[140px]'>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type='button'
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-blue-50 ${categoryId === cat.id ? 'font-bold bg-blue-50' : ''}`}
                  style={{
                    color: cat.color,
                    borderLeft: `4px solid ${cat.color}`,
                  }}
                  onClick={() => {
                    setCategoryId(cat.id)
                    setShowCategory(false)
                  }}
                >
                  <span
                    className='w-3 h-3 rounded-full mr-2'
                    style={{ background: cat.color, display: 'inline-block' }}
                  ></span>
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Botón de prioridad con popover */}
        <div className='relative'>
          <button
            type='button'
            className='rounded-full w-8 h-8 flex items-center justify-center border-2'
            style={{
              borderColor: currentPriority?.color,
              color: currentPriority?.color,
              background:
                priority === 'urgente'
                  ? VALNET_ORANGE + '22'
                  : priority === 'normal'
                    ? VALNET_BLUE + '22'
                    : '#fffbe6',
            }}
            onClick={() => setShowPriority((v) => !v)}
            title={currentPriority?.label}
          >
            {currentPriority?.icon}
          </button>
          {showPriority && (
            <div className='absolute z-20 bg-white border rounded shadow-md mt-2 right-0 min-w-[120px]'>
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type='button'
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-blue-50 ${priority === opt.value ? 'font-bold bg-blue-50' : ''}`}
                  style={{ color: opt.color }}
                  onClick={() => {
                    setPriority(opt.value)
                    setShowPriority(false)
                  }}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Botón de enviar con long press */}
        <div className='relative'>
          <button
            type='submit'
            className='ml-auto rounded-full p-2 flex items-center justify-center shadow transition relative'
            style={{ background: VALNET_BLUE, color: '#fff' }}
            disabled={uploading}
            title='Publicar'
            onMouseDown={handleSendMouseDown}
            onMouseUp={handleSendMouseUp}
            onMouseLeave={handleSendMouseLeave}
            onTouchStart={handleSendMouseDown}
            onTouchEnd={handleSendMouseUp}
          >
            <ArrowUp className='w-5 h-5' />
          </button>
          {/* Popover para imagen y audio */}
          {showPopover && (
            <div className='absolute z-40 right-0 mt-2 bg-white border rounded shadow-lg p-4 min-w-[180px] flex flex-col gap-3'>
              <button
                type='button'
                className='flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-50 text-blue-700 font-semibold'
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className='w-5 h-5' /> Subir Imagen
              </button>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handleImageSelect}
              />
              <button
                type='button'
                className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-orange-50 text-orange-700 font-semibold ${isRecording ? 'bg-orange-100' : ''}`}
                onClick={
                  isRecording ? handleStopRecording : handleStartRecording
                }
              >
                <Mic className='w-5 h-5' />{' '}
                {isRecording ? 'Detener grabación' : 'Nota de voz'}
              </button>
              {recordingUrl && (
                <audio controls src={recordingUrl} className='w-full' />
              )}
              <button
                type='button'
                className='mt-2 text-xs text-gray-500 underline'
                onClick={() => setShowPopover(false)}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}

export default WallNetPostForm
