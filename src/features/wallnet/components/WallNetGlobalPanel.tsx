import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WallNetDashboardWidget } from '@/features/dashboard/components/SacDashboard'

export function WallNetGlobalPanel() {
  const [isWallNetOpen, setIsWallNetOpen] = useState(false)

  return (
    <>
      {/* WallNet Sliding Panel */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-40',
          'w-full md:w-1/3',
          isWallNetOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className='p-4'>
          <WallNetDashboardWidget />
        </div>
      </div>

      {/* Sliding Button */}
      <button
        onClick={() => setIsWallNetOpen(!isWallNetOpen)}
        className={cn(
          'fixed right-0 bottom-10 p-2 rounded-l-lg shadow-lg z-50 transition-all duration-300 ease-in-out transform',
          isWallNetOpen
            ? 'bg-red-500 translate-x-0 w-12 h-12'
            : 'bg-[#005BAA] translate-x-0 w-32 h-12'
        )}
      >
        {isWallNetOpen ? (
          <X className='w-8 h-8 text-white' />
        ) : (
          <div className='flex items-center justify-center w-full h-full'>
            <img
              src='/wallnet-white.png'
              alt='WallNet'
              className='w-auto h-8'
            />
          </div>
        )}
      </button>
    </>
  )
}
