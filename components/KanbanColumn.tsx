// This code is all about the KanbanColumn component in a Kanban board application.
// It handles displaying tasks within a column, adding new tasks, and removing the column itself.

"use client"

// React and DnD Kit imports 
import { useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { TaskCard } from "./TaskCard"

interface Task {
  id: string
  title: string
}

// Props for KanbanColumn component
// Why props , cuz this component is reusable for any column in the board 
interface KanbanColumnProps {
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


// KanbanColumn component definition
export function KanbanColumn({ 
  columnId, 
  title, 
  taskIds, 
  tasks, 
  isOnline,
  isDoneColumn,
  color,
  bgColor,
  onAddTask,
  onRemoveTask,
  onRemoveColumn
}: KanbanColumnProps) {
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [isAddingTask, setIsAddingTask] = useState(false)
  
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
  })

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTaskTitle.trim() && isOnline) {
      onAddTask(columnId, newTaskTitle.trim())
      setNewTaskTitle("")
      setIsAddingTask(false)
    }
  }

  const handleRemoveColumn = () => {
    if (confirm(`Remove "${title}" column and all its tasks?`)) {
      onRemoveColumn(columnId)
    }
  }


  // JSX for rendering the KanbanColumn
  
  return (
    <div className="flex flex-col w-80 flex-shrink-0">
      {/* Column Header */}
      <div className="flex items-center justify-end mb-3 px-1">
        <button
          onClick={() => setIsAddingTask(true)}
          disabled={!isOnline}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
          aria-label="Add task"
        >
          <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 rounded-xl p-4 min-h-[400px]
          transition-all duration-200
          ${isOver ? 'ring-2 ring-opacity-50' : ''}
        `}
        style={{ 
          backgroundColor: bgColor,
          ...(isOver && { ringColor: color })
        }}
      >
        <SortableContext
          items={taskIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {taskIds.map((taskId) => {
              const task = tasks[taskId]
              return (
                <TaskCard
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  isOnline={isOnline}
                  isDone={isDoneColumn}
                  color={color}
                  onRemove={onRemoveTask}
                />
              )
            })}
            
            {/* Add Task Form */}
            {isAddingTask && (
              <form onSubmit={handleAddTask} className="animate-slide-in">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onBlur={() => !newTaskTitle && setIsAddingTask(false)}
                  placeholder="Enter task title..."
                  autoFocus
                  className="w-full px-4 py-3 text-sm text-gray-900 placeholder-gray-400 rounded-lg border border-gray-300 
                           focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                           bg-white shadow-sm"
                />
              </form>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}
