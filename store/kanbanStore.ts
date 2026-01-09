import { create } from "zustand"

/**
 * WHY Zustand?
 * - Global state without boilerplate
 * - Fine-grained subscriptions (performance)
 * - Easy to reason about for interviews
 */

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
  setOnline: (online: boolean) => void

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
}))
