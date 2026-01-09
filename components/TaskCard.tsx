// This code defines a TaskCard component for a Kanban board application.
// It represents individual tasks within columns, with drag-and-drop support and removal functionality.
"use client"

// React and DnD Kit imports
import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// Props for TaskCard component
interface TaskCardProps {
  id: string
  title: string
  isOnline: boolean
  isDone?: boolean
  color: string
  onRemove: (id: string) => void
}

// TaskCard component definition
export function TaskCard({ id, title, isOnline, isDone, color, onRemove }: TaskCardProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsRemoving(true)
    setTimeout(() => onRemove(id), 300)
  }

  // JSX for rendering the TaskCard
  // Here we apply drag-and-drop and removal features for the task card
  // We can also show a checkmark if the task is done and style it based on online status.
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        group relative bg-white rounded-lg shadow-sm hover:shadow-md 
        transition-all duration-200 cursor-grab active:cursor-grabbing
        border border-gray-100 overflow-hidden
        ${isDragging ? 'opacity-50 shadow-xl scale-105 rotate-2' : ''}
        ${isRemoving ? 'animate-fade-out' : 'animate-pin-in'}
        ${!isOnline ? 'cursor-not-allowed opacity-60' : ''}
      `}
    >
      {/* Colored accent curve in corner */}
      <div 
        className="absolute top-0 left-0 w-16 h-16 rounded-br-full opacity-20"
        style={{ backgroundColor: color }}
      />
      
      <div className="p-4 pr-8 relative">
        <p className="text-sm text-gray-800 leading-relaxed font-medium">{title}</p>
      </div>
      
      {isDone && (
        <div className="absolute top-3 right-3 animate-check-in">
          <svg 
            className="w-5 h-5 text-green-500" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2.5" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      
      {isOnline && (
        <button
          onClick={handleRemove}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 
                     transition-opacity duration-200 text-gray-400 hover:text-red-500"
          aria-label="Remove task"
        >
          <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
