import React, { useEffect, useRef } from 'react'
import { useWallNetStore } from '@/stores/wallNetStore'
import WallNetPostItem from './WallNetPostItem'
import WallNetPostForm from './WallNetPostForm'
import { useWallNetCategories } from './hooks/useWallNetCategories'

interface WallNetFeedProps {
  maxPosts?: number
  showForm?: boolean
  height?: string
}

const WallNetFeed: React.FC<WallNetFeedProps> = ({ maxPosts, showForm = true, height = '500px' }) => {
  const posts = useWallNetStore((s) => s.posts)
  const postsToShow = maxPosts ? posts.slice(0, maxPosts) : posts
  const { fetchCategories } = useWallNetCategories()
  const feedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = 0
    }
  }, [postsToShow.length])

  return (
    <div className="flex flex-col bg-slate-100 rounded-lg p-2 gap-2" style={{ height }}>
      <div
        ref={feedRef}
        className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1"
        style={{ minHeight: 0 }}
      >
        {postsToShow.length === 0 ? (
          <p className="text-center text-muted-foreground">No hay publicaciones aún.</p>
        ) : (
          postsToShow.map((post) => (
            <WallNetPostItem key={post.id} post={post} />
          ))
        )}
      </div>
      {showForm && (
        <div className="rounded-xl border bg-white shadow-sm p-4 mt-2">
          <WallNetPostForm />
        </div>
      )}
    </div>
  )
}

export default WallNetFeed 