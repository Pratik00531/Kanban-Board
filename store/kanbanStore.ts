import { create } from "zustand"

type Task = {
  id: string
  title: string
}

type Column = {
  id: string
  title: string
  taskIds: string[]
}

type KanbanStore = {
  tasks: Record<string, Task>
  columns: Record<string, Column>
  columnOrder: string[]
  isOnline: boolean
  setOnline: (status: boolean) => void

  // 👇 REQUIRED for drag & drop
  moveTask: (
    fromColumnId: string,
    toColumnId: string,
    fromIndex: number,
    toIndex: number
  ) => void
}

export const useKanbanStore = create<KanbanStore>((set) => ({
  tasks: {
    "task-1": { id: "task-1", title: "Beatrice Barista" },
    "task-2": { id: "task-2", title: "Rita Roastinghouse" },
  },

  columns: {
    "col-1": {
      id: "col-1",
      title: "New",
      taskIds: ["task-1", "task-2"],
    },
    "col-2": {
      id: "col-2",
      title: "In Progress",
      taskIds: [],
    },
    "col-3": {
      id: "col-3",
      title: "Done",
      taskIds: [],
    },
  },

  columnOrder: ["col-1", "col-2", "col-3"],
  isOnline: true,

  setOnline: (status) => set({ isOnline: status }),

  /**
   * WHY this exists:
   * - Centralized immutable state update
   * - Handles reorder & cross-column move
   */
  moveTask: (fromCol, toCol, fromIndex, toIndex) =>
    set((state) => {
      const sourceTaskIds = [...state.columns[fromCol].taskIds]
      const destinationTaskIds =
        fromCol === toCol
          ? sourceTaskIds
          : [...state.columns[toCol].taskIds]

      const [movedTask] = sourceTaskIds.splice(fromIndex, 1)
      destinationTaskIds.splice(toIndex, 0, movedTask)

      return {
        columns: {
          ...state.columns,
          [fromCol]: {
            ...state.columns[fromCol],
            taskIds: sourceTaskIds,
          },
          [toCol]: {
            ...state.columns[toCol],
            taskIds: destinationTaskIds,
          },
        },
      }
    }),
}))
