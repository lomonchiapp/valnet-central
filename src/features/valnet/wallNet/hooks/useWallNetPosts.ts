import { useWallNetStore } from '@/stores/wallNetStore'
import { WallNetNewPost, WallNetPost } from '@/types/interfaces/valnet/wallNet'
import { database, storage } from '@/firebase'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  Timestamp,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  deleteDoc
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useEffect } from 'react'

export interface WallNetComment {
  id: string
  userId: string
  userName: string
  content: string
  createdAt: number
}

// Subir imagen comprimida a Storage
export async function uploadImage(blob: Blob): Promise<string> {
  const fileRef = ref(storage, `wallNetImages/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`)
  await uploadBytes(fileRef, blob)
  return await getDownloadURL(fileRef)
}

// Subir audio a Storage
export async function uploadAudio(blob: Blob): Promise<string> {
  const fileRef = ref(storage, `wallNetAudio/${Date.now()}_${Math.random().toString(36).slice(2)}.webm`)
  await uploadBytes(fileRef, blob)
  return await getDownloadURL(fileRef)
}

export function useWallNetPosts() {
  const setPosts = useWallNetStore((s) => s.setPosts)
  const setLoading = useWallNetStore((s) => s.setLoading)

  // Escuchar en tiempo real los posts
  useEffect(() => {
    setLoading(true)
    const q = query(collection(database, 'wallNetPosts'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts: WallNetPost[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WallNetPost))
      setPosts(posts)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [setPosts, setLoading])

  // Publicar un nuevo post
  const postMessage = async (newPost: WallNetNewPost, user: { id: string, name: string, avatar?: string }, category: { id: string, name: string, color?: string }) => {
    setLoading(true)
    await addDoc(collection(database, 'wallNetPosts'), {
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar || '',
      content: newPost.content,
      imageUrl: newPost.imageUrl || '',
      audioUrl: newPost.audioUrl || '',
      createdAt: Timestamp.now().toMillis(),
      category: category,
      priority: newPost.priority,
      likes: [],
      commentsCount: 0
    })
    setLoading(false)
  }

  // Like/Unlike
  const toggleLike = async (postId: string, userId: string, liked: boolean) => {
    const postRef = doc(database, 'wallNetPosts', postId)
    await updateDoc(postRef, {
      likes: liked ? arrayRemove(userId) : arrayUnion(userId)
    })
  }

  // Obtener comentarios en tiempo real para un post y actualizar commentsCount
  const listenComments = (postId: string, callback: (comments: WallNetComment[]) => void) => {
    const q = query(collection(database, 'wallNetPosts', postId, 'comments'), orderBy('createdAt', 'asc'))
    return onSnapshot(q, async (snapshot) => {
      const comments: WallNetComment[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WallNetComment))
      callback(comments)
      // Actualizar commentsCount en el post
      const postRef = doc(database, 'wallNetPosts', postId)
      await updateDoc(postRef, { commentsCount: comments.length })
    })
  }

  // Agregar un comentario a un post
  const addComment = async (postId: string, user: { id: string, name: string }, content: string) => {
    const commentsRef = collection(database, 'wallNetPosts', postId, 'comments')
    await addDoc(commentsRef, {
      userId: user.id,
      userName: user.name,
      content,
      createdAt: Timestamp.now().toMillis()
    })
  }

  // Eliminar un comentario
  const removeComment = async (postId: string, commentId: string) => {
    const commentRef = doc(database, 'wallNetPosts', postId, 'comments', commentId)
    await deleteDoc(commentRef)
  }

  // Editar un post
  const editPost = async (postId: string, newContent: string) => {
    const postRef = doc(database, 'wallNetPosts', postId)
    await updateDoc(postRef, { content: newContent })
  }

  // Eliminar un post
  const deletePost = async (postId: string) => {
    const postRef = doc(database, 'wallNetPosts', postId)
    await deleteDoc(postRef)
  }

  return { postMessage, toggleLike, listenComments, addComment, removeComment, editPost, deletePost, uploadImage, uploadAudio }
} 