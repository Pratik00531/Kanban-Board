// Welcome to the Kanban Board component!
// This is where the core logic of our kanban board  lives.


// First, we import necessary libraries and hooks
"use client"

import { useEffect, useState } from "react"
import { useKanbanStore } from "@/store/kanbanStore"
import { 
  DndContext, 
  closestCenter, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent
} from "@dnd-kit/core"
import { 
  SortableContext, 
  horizontalListSortingStrategy 
} from "@dnd-kit/sortable"
import { DraggableColumn } from "./DraggableColumn"
import { playCompletionSound } from "@/utils/sound"


// After imports, we define some constants and helper functions

/**
 * Soft color palette for professional aesthetic
 * Each column gets a unique color from this array (cycles after 8 columns)
  */
const COLUMN_COLORS = [
  { color: '#8B7FD6', bg: '#F5F3FF' }, // Soft purple
  { color: '#F59E0B', bg: '#FFF7ED' }, // Soft orange
  { color: '#8B5CF6', bg: '#FAF5FF' }, // Soft violet
  { color: '#EC4899', bg: '#FDF2F8' }, // Soft pink
  { color: '#10B981', bg: '#ECFDF5' }, // Soft green
  { color: '#3B82F6', bg: '#EFF6FF' }, // Soft blue
  { color: '#F59E0B', bg: '#FFFBEB' }, // Soft amber
  { color: '#06B6D4', bg: '#ECFEFF' }, // Soft cyan
]

const getColumnColor = (index: number) => {
  return COLUMN_COLORS[index % COLUMN_COLORS.length]
}

// Now we define the main KanbanBoard component
export function KanbanBoard() {
  /**
   * Using Zustand for global state management
   * Using granular selectors to prevent unnecessary re-renders
*/
  const columnOrder = useKanbanStore((state) => state.columnOrder)
  const columns = useKanbanStore((state) => state.columns)
  const tasks = useKanbanStore((state) => state.tasks)
  const isOnline = useKanbanStore((state) => state.isOnline)
  const setOnline = useKanbanStore((state) => state.setOnline)
  const moveTask = useKanbanStore((state) => state.moveTask)
  const addTask = useKanbanStore((state) => state.addTask)
  const removeTask = useKanbanStore((state) => state.removeTask)
  const addColumn = useKanbanStore((state) => state.addColumn)
  const removeColumn = useKanbanStore((state) => state.removeColumn)
  const reorderColumns = useKanbanStore((state) => state.reorderColumns)

  const [newColumnTitle, setNewColumnTitle] = useState("")
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [showOfflineToast, setShowOfflineToast] = useState(false)
  const [showDragBlockedToast, setShowDragBlockedToast] = useState(false)

  /**
   * Now , browsing online/offline event listeners
   * This is the "Offline Guard" requirement - we listen to native browser events
   * and sync them into our global Zustand state for centralized control
   */
  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => {
      setOnline(false)
      setShowOfflineToast(true)
      setTimeout(() => setShowOfflineToast(false), 3000)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    /**
     *Cleaning up the event listeners too prevents memory leaks
     * it is Essential for React strict mode and component unmounts
     */
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [setOnline])

  /**
   * Now, dnd-kit sensors for drag interaction
   * PointerSensor with 5px activation constraint prevents accidental drags
   * This improves UX for users with shaky hands or on touch devices
   */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  /**
   *This is Central drag-and-drop handler
   * Handles BOTH column reordering AND task movement
   * This is where we intercept and block offline drag attempts
   */
  const handleDragEnd = (event: DragEndEvent) => {

    if (!isOnline) {
      setShowDragBlockedToast(true)
      setTimeout(() => setShowDragBlockedToast(false), 3000)
      return
    }

    const { active, over } = event
    if (!over) return
    if (active.id === over.id) return

    /**  Here , we handle column reordering.Every column has id format 'column-{columnId}'and 
    ** we check for that prefix to identify column drags
    */
    if (active.id.toString().startsWith('column-')) {
      const activeColumnId = active.id.toString().replace('column-', '')
      const overColumnId = over.id.toString().replace('column-', '')
      
      const oldIndex = columnOrder.indexOf(activeColumnId)
      const newIndex = columnOrder.indexOf(overColumnId)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderColumns(oldIndex, newIndex)
      }
      return
    }

    /**
     *This is Task movement logic
     * We find source and destination columns, then calculate new indices
     * All state updates go through Zustand to maintain immutability
     */
    const sourceColumnId = columnOrder.find((colId) =>
      columns[colId].taskIds.includes(active.id as string)
    )

    if (!sourceColumnId) return

    let destinationColumnId: string | undefined

    /**
     * This checks if dropped directly on a column vs on another task
     * columns[over.id] checks if the drop target is a column container
     */
    if (columns[over.id as string]) {
      destinationColumnId = over.id as string
    } else {
      destinationColumnId = columnOrder.find((colId) =>
        columns[colId].taskIds.includes(over.id as string)
      )
    }

    if (!destinationColumnId) {
      destinationColumnId = sourceColumnId
    }

    const sourceTasks = columns[sourceColumnId].taskIds
    const destTasks = columns[destinationColumnId].taskIds

    const oldIndex = sourceTasks.indexOf(active.id as string)
    const newIndex = destTasks.includes(over.id as string)
      ? destTasks.indexOf(over.id as string)
      : destTasks.length

    moveTask(sourceColumnId, destinationColumnId, oldIndex, newIndex)

    /**
     * Also adding completion sound and visual feedback
     * The LAST column is always treated as the "completion" column
     * This is flexible - users can reorder columns and the logic adapts
     */
    const isMovedToLastColumn = columnOrder.indexOf(destinationColumnId) === columnOrder.length - 1
    if (isOnline && isMovedToLastColumn) {
      setTimeout(() => playCompletionSound(), 150)
    }
  }

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault()
    if (newColumnTitle.trim() && isOnline) {
      addColumn(newColumnTitle.trim())
      setNewColumnTitle("")
      setIsAddingColumn(false)
    }
  }

  const handleRemoveColumn = (columnId: string) => {
    const column = columns[columnId]
    if (confirm(`Remove "${column.title}" column and all its tasks?`)) {
      removeColumn(columnId)
    }
  }

  const isLastColumn = (columnId: string) => {
    return columnOrder.indexOf(columnId) === columnOrder.length - 1
  }

  return (
    <div
      className={`
        min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50
        p-8 transition-all duration-300
        ${!isOnline ? 'saturate-50 opacity-90' : ''}
      `}
    >
      {/* Header */}
      <div className="max-w-[1600px] mx-auto mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Recruitment Kanban Board</h1>
        </div>
      </div>

      {/* Offline Toast - Shows when connection is lost */}
      {showOfflineToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-800 px-6 py-4 rounded-lg shadow-lg max-w-md">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-medium">You're offline</p>
                <p className="text-sm">Drag & drop is temporarily disabled</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drag Blocked Toast - Shows when user attempts drag while offline */}
      {showDragBlockedToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-lg shadow-lg max-w-md">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <div>
                <p className="font-medium">Connection lost: Action disabled</p>
                <p className="text-sm">Please check your internet connection</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Board */}
      <div className="max-w-[1600px] mx-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={columnOrder.map(id => `column-${id}`)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex gap-6 overflow-x-auto pb-8">
              {columnOrder.map((columnId, index) => {
                const column = columns[columnId]
                const { color, bg } = getColumnColor(index)
                return (
                  <DraggableColumn
                    key={column.id}
                    columnId={column.id}
                    title={column.title}
                    taskIds={column.taskIds}
                    tasks={tasks}
                    isOnline={isOnline}
                    isDoneColumn={isLastColumn(columnId)}
                    color={color}
                    bgColor={bg}
                    onAddTask={addTask}
                    onRemoveTask={removeTask}
                    onRemoveColumn={handleRemoveColumn}
                  />
                )
              })}
            
              {/* Add Column Button */}
              {isAddingColumn ? (
                <div className="w-80 flex-shrink-0 animate-slide-in">
                  <form onSubmit={handleAddColumn} className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                    <input
                      type="text"
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      onBlur={() => !newColumnTitle && setIsAddingColumn(false)}
                      placeholder="Enter column name..."
                      autoFocus
                      className="w-full px-4 py-3 text-sm text-gray-900 placeholder-gray-400 rounded-lg border border-gray-300 
                               focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </form>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingColumn(true)}
                  disabled={!isOnline}
                  className="w-80 h-[100px] flex-shrink-0 flex items-center justify-center gap-2
                           bg-gray-50/50 hover:bg-gray-100/50 border-2 border-dashed border-gray-300
                           rounded-xl transition-all duration-200 text-gray-500 hover:text-gray-700
                           hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="font-medium">Add Column</span>
                </button>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}


// That's the end of the KanbanBoard component!
// This component integrates drag-and-drop, offline handling, and dynamic column/task management