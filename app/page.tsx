"use client"

import { useEffect , useState} from "react"
import { useKanbanStore } from "@/store/kanbanStore"

// Importing Drag and Drop components 
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core"

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"

import { CSS } from "@dnd-kit/utilities"


// Making the function for Draggable Card
function DraggableCard({ id, title, isOnline }: { id: string; title: string; isOnline: boolean }) {
  // Making the card sortable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white p-3 rounded shadow-sm cursor-grab ${
        !isOnline ? "cursor-not-allowed" : ""
      }`}
    >
      {title}
    </div>
  )
}

// Droppable Column Component
function DroppableColumn({ columnId, title, taskIds, isOnline, tasks }: { 
  columnId: string; 
  title: string; 
  taskIds: string[]; 
  isOnline: boolean;
  tasks: Record<string, { id: string; title: string }>;
}) {
  const { setNodeRef } = useDroppable({
    id: columnId,
  })

  return (
    <div
      ref={setNodeRef}
      className="w-72 bg-gray-50 rounded-md shadow-sm p-4"
    >
      <h2 className="font-semibold mb-4">{title}</h2>

      <SortableContext
        items={taskIds}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3 min-h-[100px]">
          {taskIds.map((taskId) => {
            const task = tasks[taskId]
            return (
              <DraggableCard
                key={task.id}
                id={task.id}
                title={task.title}
                isOnline={isOnline}
              />
            )
          })}
        </div>
      </SortableContext>
    </div>
  )
}

// Main Page and Logic of the Online/Offline status
export default function Page() {
  // Select only what this component needs (performance)
  const columnOrder = useKanbanStore((state) => state.columnOrder)
  const columns = useKanbanStore((state) => state.columns)
  const tasks = useKanbanStore((state) => state.tasks)
  const isOnline = useKanbanStore((state) => state.isOnline)
  const setOnline = useKanbanStore((state) => state.setOnline)
  const moveTask = useKanbanStore((state) => state.moveTask)

  useEffect(() => {
    /**
     * WHY:
     * - Browser exposes online/offline events
     * - We sync them into global state
     * - Global state becomes single source of truth
     */

    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Cleaning it up to avoid duplicate listeners
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [setOnline])


  // Setting up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  // Handling drag end event between columns

 const handleDragEnd = (event: any) => {
  // Checkiing if online
  if (!isOnline) {
    alert("Connection lost: Action disabled")
    return
  }
  const { active, over } = event
  if (!over) return
  if (active.id === over.id) return

  //Now if online , proceed with moving the task
  /**
   * So, we need to figure out:
   * - From which column the task was dragged (sourceColumnId)
   * - To which column the task was dropped (destinationColumnId)
   */
  // 1 Find source column
  const sourceColumnId = columnOrder.find((colId) =>
    columns[colId].taskIds.includes(active.id)
  )

  if (!sourceColumnId) return

  // 2 Find destination column
  let destinationColumnId: string | undefined

  // Check if dropped on a column directly (safer than columnOrder.includes)
  // This prevents collision if a task ID accidentally matches a column ID
  if (columns[over.id]) {
    destinationColumnId = over.id
  } else {
    // Dropped on a task, find which column contains this task
    destinationColumnId = columnOrder.find((colId) =>
      columns[colId].taskIds.includes(over.id)
    )
  }

  // Fallback to source column if destination not found
  if (!destinationColumnId) {
    destinationColumnId = sourceColumnId
  }

  const sourceTasks = columns[sourceColumnId].taskIds
  const destTasks = columns[destinationColumnId].taskIds

  const oldIndex = sourceTasks.indexOf(active.id)

  // If dropped on a task, insert before that task
  // If dropped on column, add to end
  const newIndex = destTasks.includes(over.id)
    ? destTasks.indexOf(over.id)
    : destTasks.length

  moveTask(
    sourceColumnId,
    destinationColumnId,
    oldIndex,
    newIndex
  )
}


  return (

    // Online/Offline UI changes
    <div
      className={`min-h-screen bg-gray-100 p-6 transition-opacity ${
        !isOnline ? "opacity-60" : ""
      }`}
    >
      {!isOnline && (
        <div className="mb-4 rounded bg-red-100 text-red-700 px-4 py-2 text-sm font-medium">
          You are offline. Drag & drop is disabled.
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6">
          {columnOrder.map((columnId) => {
            const column = columns[columnId]

            return (
              <DroppableColumn
                key={column.id}
                columnId={column.id}
                title={column.title}
                taskIds={column.taskIds}
                isOnline={isOnline}
                tasks={tasks}
              />
            )
          })}
        </div>
      </DndContext>
    </div>
  )
}
