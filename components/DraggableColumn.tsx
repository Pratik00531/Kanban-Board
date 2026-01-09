// This code defines a DraggableColumn component for a Kanban board application.
// Basically , it wraps the KanbanColumn component with drag-and-drop functionality using DnD Kit.
// Difference from KanbanColumn.tsx is that this file adds the drag-and-drop features.
// Difference from KanbanBoard.tsx is that this file focuses on individual columns, not the whole board.

"use client"

// DnD Kit imports

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { KanbanColumn } from "./KanbanColumn"

interface Task {
  id: string
  title: string
}

// Props for DraggableColumn component, Same reason as KanbanColumnProps
interface DraggableColumnProps {
  columnId: string
  title: string
  taskIds: string[]
  tasks: Record<string, Task>
  isOnline: boolean
  isDoneColumn?: boolean
  color: string
  bgColor: string
  onAddTask: (columnId: string, title: string) => void
  onRemoveTask: (taskId: string) => void
  onRemoveColumn: (columnId: string) => void
}


// DraggableColumn component definition

export function DraggableColumn(props: DraggableColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: `column-${props.columnId}`,
    data: { type: 'column' }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // JSX for rendering the DraggableColumn
  // Here we wrap KanbanColumn with drag-and-drop features
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'opacity-50' : ''}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mb-2">
        <div className="flex items-center justify-between px-1 py-2 rounded-lg hover:bg-gray-100/50 transition-colors">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M4 8h16M4 16h16" />
            </svg>
            <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
              {props.title}
            </h2>
            <span 
              className="text-xs text-gray-600 font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: props.bgColor }}
            >
              {props.taskIds.length}
            </span>
          </div>
          
          {props.isOnline && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                props.onRemoveColumn(props.columnId)
              }}
              className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
              aria-label="Remove column"
            >
              <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <KanbanColumn {...props} />
    </div>
  )
}

// That's the end of the DraggableColumn component!
// This component integrates drag-and-drop functionality with the KanbanColumn component.
