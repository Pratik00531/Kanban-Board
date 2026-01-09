"use client"

import { useEffect } from "react"
import { useKanbanStore } from "@/store/kanbanStore"

export default function Page() {
  // Select only what this component needs (performance)
  const columnOrder = useKanbanStore((state) => state.columnOrder)
  const columns = useKanbanStore((state) => state.columns)
  const tasks = useKanbanStore((state) => state.tasks)
  const isOnline = useKanbanStore((state) => state.isOnline)
  const setOnline = useKanbanStore((state) => state.setOnline)

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

    // Cleanup is critical to avoid duplicate listeners
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [setOnline])

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

      <div className="flex gap-6">
        {columnOrder.map((columnId) => {
          const column = columns[columnId]

          return (
            <div
              key={column.id}
              className="w-72 bg-gray-50 rounded-md shadow-sm p-4"
            >
              <h2 className="font-semibold mb-4">
                {column.title}
              </h2>

              <div className="space-y-3">
                {column.taskIds.map((taskId) => {
                  const task = tasks[taskId]

                  return (
                    <div
                      key={task.id}
                      className="bg-white p-3 rounded shadow-sm"
                    >
                      {task.title}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
