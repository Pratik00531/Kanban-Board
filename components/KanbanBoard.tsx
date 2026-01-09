"use client"

import { useEffect } from "react"
import { useKanbanStore } from "@/store/kanbanStore"
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { KanbanColumn } from "./KanbanColumn"

export function KanbanBoard() {
  const columnOrder = useKanbanStore((state) => state.columnOrder)
  const columns = useKanbanStore((state) => state.columns)
  const tasks = useKanbanStore((state) => state.tasks)
  const isOnline = useKanbanStore((state) => state.isOnline)
  const setOnline = useKanbanStore((state) => state.setOnline)
  const moveTask = useKanbanStore((state) => state.moveTask)

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [setOnline])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const handleDragEnd = (event: any) => {
    if (!isOnline) {
      alert("Connection lost: Action disabled")
      return
    }

    const { active, over } = event
    if (!over) return
    if (active.id === over.id) return

    const sourceColumnId = columnOrder.find((colId) =>
      columns[colId].taskIds.includes(active.id)
    )

    if (!sourceColumnId) return

    let destinationColumnId: string | undefined

    if (columnOrder.includes(over.id)) {
      destinationColumnId = over.id
    } else {
      destinationColumnId = columnOrder.find((colId) =>
        columns[colId].taskIds.includes(over.id)
      )
    }

    if (!destinationColumnId) {
      destinationColumnId = sourceColumnId
    }

    const sourceTasks = columns[sourceColumnId].taskIds
    const destTasks = columns[destinationColumnId].taskIds

    const oldIndex = sourceTasks.indexOf(active.id)
    const newIndex = destTasks.includes(over.id)
      ? destTasks.indexOf(over.id)
      : destTasks.length

    moveTask(sourceColumnId, destinationColumnId, oldIndex, newIndex)
  }

  return (
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
              <KanbanColumn
                key={column.id}
                columnId={column.id}
                title={column.title}
                taskIds={column.taskIds}
                tasks={tasks}
                isOnline={isOnline}
              />
            )
          })}
        </div>
      </DndContext>
    </div>
  )
}
