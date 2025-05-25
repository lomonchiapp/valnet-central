import React, { useState, useEffect, useRef } from 'react'
import { WallNetPost } from '@/types/interfaces/valnet/wallNet'
import { useAuthStore } from '@/stores/authStore'
import { useWallNetPosts, WallNetComment } from './hooks/useWallNetPosts'
import { ArrowUp, Trash2, Edit2, X, Check, Users } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  post: WallNetPost
}

// Utilidad para tiempo relativo
function timeAgo(date: number) {
  const now = Date.now()
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60) return `hace ${diff}s`
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`
  return `hace ${Math.floor(diff / 86400)}d`
}

const PRIORITY_STYLE = {
  normal: 'border-2 border-[#1976d2] shadow-[0_2px_12px_0_rgba(25,118,210,0.08)] hover:shadow-[0_0_0_4px_rgba(25,118,210,0.15)]',
  importante: 'border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-white shadow-[0_2px_12px_0_rgba(250,204,21,0.10)] hover:shadow-[0_0_0_4px_rgba(250,204,21,0.18)]',
  urgente: 'border-2 border-[#F37021] bg-gradient-to-br from-orange-50 to-white shadow-[0_2px_12px_0_rgba(243,112,33,0.12)] hover:shadow-[0_0_0_4px_rgba(243,112,33,0.20)]',
}

const WallNetPostItem: React.FC<Props> = ({ post }) => {
  const { user } = useAuthStore()
  const { toggleLike, listenComments, addComment, removeComment, editPost, deletePost } = useWallNetPosts()
  const userId = user?.id
  const isOwner = userId === post.userId
  const hasLiked = userId ? post.likes.includes(userId) : false
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<WallNetComment[]>([])
  const [commentText, setCommentText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [likeAnim, setLikeAnim] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content)
  const [showDelete, setShowDelete] = useState(false)
  const [showLikes, setShowLikes] = useState(false)

  useEffect(() => {
    if (showComments) {
      const unsubscribe = listenComments(post.id, setComments)
      return () => unsubscribe()
    }
  }, [showComments, post.id, listenComments])

  useEffect(() => {
    if (showComments && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [comments, showComments])

  const handleLike = async () => {
    if (!userId) return
    setLikeAnim(true)
    await toggleLike(post.id, userId, hasLiked)
    setTimeout(() => setLikeAnim(false), 350)
  }

  const handleCommentSend = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault()
    if (!user || !commentText.trim()) return
    await addComment(post.id, { id: user.id, name: `${user.nombres} ${user.apellidos}` }, commentText.trim())
    setCommentText('')
    if (inputRef.current) inputRef.current.focus()
  }

  const handleRemoveComment = async (commentId: string) => {
    if (!user) return
    await removeComment(post.id, commentId)
  }

  const handleEdit = async () => {
    if (!editContent.trim()) return
    await editPost(post.id, editContent.trim())
    setEditing(false)
  }

  const handleDelete = async () => {
    await deletePost(post.id)
    setShowDelete(false)
  }

  // Simulación: obtener nombres de usuarios por id (en real, deberías mapear ids a nombres)
  const getUserName = (id: string) => {
    if (user && id === user.id) return user.nombres + ' (Tú)'
    return 'Usuario ' + id.slice(-4)
  }

  return (
    <AnimatePresence>
      <motion.div
        className={`rounded-xl p-4 flex gap-3 flex-col transition-all duration-200 ${PRIORITY_STYLE[post.priority]}`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        layout
      >
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {post.userAvatar ? (
              <img src={post.userAvatar} alt={post.userName} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-lg text-primary">
                {post.userName[0]}
              </div>
            )}
          </div>
          {/* Contenido */}
          <div className="flex-1 min-w-0 relative">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-base truncate">{post.userName}</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: post.category.color || '#eee', color: '#fff' }}>{post.category.name}</span>
              <span className="ml-auto">
                <span className="text-xs px-2 py-0.5 absolute right-0 top-0
                rounded-full bg-gray-200 text-gray-700 font-semibold">{timeAgo(post.createdAt)}</span>
              </span>
            </div>
            {editing ? (
              <div className="flex gap-2 items-center mt-2">
                <textarea
                  className="flex-1 border rounded px-2 py-1 text-base focus:outline-none focus:ring-2 focus:ring-[#0053A0]"
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  rows={2}
                  maxLength={300}
                  autoFocus
                />
                <button className="p-2 rounded-full bg-[#0053A0] text-white hover:bg-[#0053A0]/90 transition" title="Guardar" onClick={handleEdit}><Check className="w-4 h-4" /></button>
                <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition" title="Cancelar" onClick={() => setEditing(false)}><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="text-base whitespace-pre-line break-words mb-2">{post.content}</div>
            )}
            {post.imageUrl && (
              <img src={post.imageUrl} alt="post" className="max-w-full max-h-60 rounded-lg border mb-2" />
            )}
            <div className="flex gap-4 text-sm text-muted-foreground mt-2 items-center relative group">
              <div className="relative">
                <motion.button
                  className={`flex items-center gap-1 hover:text-[#0053A0] transition ${hasLiked ? 'text-[#0053A0] font-bold' : ''}`}
                  onClick={handleLike}
                  disabled={!userId}
                  aria-label={hasLiked ? 'Quitar like' : 'Dar like'}
                  animate={likeAnim ? { scale: 1.3 } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  onMouseEnter={() => setShowLikes(true)}
                  onMouseLeave={() => setShowLikes(false)}
                  onClickCapture={() => setShowLikes(v => !v)}
                >
                  <span role="img" aria-label="like">👍</span> {post.likes.length}
                </motion.button>
                {/* Popover de usuarios que dieron like */}
                {showLikes && post.likes.length > 0 && (
                  <div className="absolute left-0 top-8 z-30 bg-white border rounded shadow-lg min-w-[180px] p-2 animate-fade-in">
                    <div className="flex items-center gap-2 mb-2 text-[#0053A0] font-semibold"><Users className="w-4 h-4" /> Likes</div>
                    <ul className="max-h-40 overflow-y-auto text-xs">
                      {post.likes.map(uid => (
                        <li key={uid} className="py-1 px-2 hover:bg-blue-50 rounded">
                          {getUserName(uid)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <button
                className="flex items-center gap-1 hover:text-[#0053A0] transition"
                onClick={() => setShowComments((v) => !v)}
                aria-label="Ver comentarios"
              >
                <span role="img" aria-label="comments">💬</span> {post.commentsCount}
              </button>
              {isOwner && !editing && (
                <span className="absolute right-0 bottom-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button className="p-1 rounded hover:bg-[#0053A0]/10" title="Editar" onClick={() => { setEditing(true); setEditContent(post.content) }}><Edit2 className="w-4 h-4 text-[#0053A0]" /></button>
                  <button className="p-1 rounded hover:bg-[#F37021]/10" title="Eliminar" onClick={() => setShowDelete(true)}><Trash2 className="w-4 h-4 text-[#F37021]" /></button>
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Confirmación de borrado */}
        {showDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
              <p className="mb-4 text-center">¿Seguro que deseas eliminar este post?</p>
              <div className="flex gap-4">
                <button className="bg-[#F37021] text-white px-4 py-2 rounded hover:bg-[#F37021]/90" onClick={handleDelete}>Eliminar</button>
                <button className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300" onClick={() => setShowDelete(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
        {/* Sección de comentarios tipo chat */}
        {showComments && (
          <div className="mt-3 border-t pt-3">
            <div ref={scrollRef} className="flex flex-col gap-2 max-h-40 overflow-y-auto mb-2 pr-1">
              <AnimatePresence>
                {comments.length === 0 ? (
                  <motion.div className="text-sm text-muted-foreground italic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Sin comentarios aún.</motion.div>
                ) : (
                  comments.map((c) => (
                    <motion.div
                      key={c.id}
                      className="flex items-center gap-2 group"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs text-[#0053A0]">
                        {c.userName[0]}
                      </div>
                      <div className="bg-gray-100 rounded px-3 py-1 text-sm flex-1 flex items-center justify-between">
                        <span>
                          <span className="font-semibold mr-2">{c.userName}</span>
                          {c.content}
                          <span className="ml-2 text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                        {user && c.userId === user.id && (
                          <button
                            className="ml-2 text-xs text-[#F37021] hover:underline opacity-70 group-hover:opacity-100"
                            title="Eliminar comentario"
                            onClick={() => handleRemoveComment(c.id)}
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
            <form onSubmit={handleCommentSend} className="flex gap-2 mt-2 items-center">
              <input
                ref={inputRef}
                type="text"
                className="flex-1 border rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#0053A0]"
                placeholder="Comentar..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleCommentSend(e) }}
                maxLength={200}
                disabled={!user}
                autoComplete="off"
              />
              <button
                type="submit"
                className="bg-[#0053A0] text-white rounded-full p-1 flex items-center justify-center shadow hover:bg-[#0053A0]/90 transition"
                disabled={!commentText.trim() || !user}
                title="Enviar"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default WallNetPostItem 