import React from 'react'
import { useStore } from '../store/useStore'

export const GuideLines: React.FC = () => {
  const guides = useStore((state) => state.guides)

  if (guides.length === 0) return null

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {guides.map((guide, index) => (
        <div
          key={index}
          className="absolute border-blue-300 opacity-40"
          style={{
            left: guide.x !== undefined ? guide.x : 0,
            top: guide.y !== undefined ? guide.y : 0,
            width: guide.x !== undefined ? 0 : '100%',
            height: guide.y !== undefined ? 0 : '100%',
            borderLeftWidth: guide.x !== undefined ? 1 : 0,
            borderTopWidth: guide.y !== undefined ? 1 : 0,
            borderStyle: 'solid'
          }}
        />
      ))}
    </div>
  )
}
