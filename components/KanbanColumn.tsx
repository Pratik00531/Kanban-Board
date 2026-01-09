"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { TaskCard } from "./TaskCard"

interface Task {
  id: string
  title: string
}

interface KanbanColumnProps {
  columnId: string
  title: string
  taskIds: string[]
  tasks: Record<string, Task>
  isOnline: boolean
}

export function KanbanColumn({ 
  columnId, 
  title, 
  taskIds, 
  tasks, 
  isOnline 
}: KanbanColumnProps) {
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
              <TaskCard
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
