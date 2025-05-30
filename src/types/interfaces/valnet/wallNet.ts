// Tipos para WallNet (muro tipo Twitter)

export type WallNetPriority = 'normal' | 'importante' | 'urgente'

export interface WallNetCategory {
  id: string
  name: string
  color: string // Para mostrar en UI, obligatorio
  visibility?: 'public' | 'private' // Visibilidad de la categoría
}

export interface WallNetPost {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  imageUrl?: string
  audioUrl?: string
  createdAt: number // timestamp
  category: WallNetCategory
  priority: WallNetPriority
  likes: string[] // userIds que dieron like
  commentsCount: number
}

export interface WallNetNewPost {
  content: string
  imageUrl?: string
  audioUrl?: string
  categoryId: string
  priority: WallNetPriority
}
