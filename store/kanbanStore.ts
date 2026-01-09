/**
 * WHY: Zustand for global state management
 * 
 * DECISION RATIONALE:
 * - Zustand chosen over Redux/Context for minimal boilerplate and better DX
 * - No provider wrapping needed - hooks work anywhere
 * - Built-in immutability patterns prevent common bugs
 * - Excellent TypeScript support with full type inference
 * 
 * DATA STRUCTURE CHOICE:
 * - tasks: Record<string, Task> - O(1) lookup by ID (better than Array.find)
 * - columns: Record<string, Column> - O(1) column access
 * - columnOrder: string[] - Explicit ordering for drag-and-drop
 * 
 * WHY NOT ARRAYS?
 * - Array.find is O(n), Record lookup is O(1) - critical for drag performance
 * - Normalized structure prevents duplicate data and sync issues
 * - Easier to update individual items without searching
 */
import { create } from "zustand"

type Task = {
  id: string
  title: string
}

type Column = {
  id: string
  title: string
  taskIds: string[] // WHY: Array of IDs instead of nested objects - keeps data normalized
}

type KanbanStore = {
  tasks: Record<string, Task>
  columns: Record<string, Column>
  columnOrder: string[]
  isOnline: boolean // WHY: Centralized online status prevents desync across components
  setOnline: (status: boolean) => void

  // 👇 REQUIRED for drag & drop
  moveTask: (
    fromColumnId: string,
    toColumnId: string,
    fromIndex: number,
    toIndex: number
  ) => void

  // 👇 Add/Remove actions
  addTask: (columnId: string, title: string) => void
  removeTask: (taskId: string) => void
  addColumn: (title: string) => void
  removeColumn: (columnId: string) => void
  reorderColumns: (fromIndex: number, toIndex: number) => void
}

export const useKanbanStore = create<KanbanStore>((set) => ({
  tasks: {
    "task-1": { id: "task-1", title: "Lisa Wang" },
    "task-2": { id: "task-2", title: "James Wilson" },
    "task-3": { id: "task-3", title: "Marcus Johnson" },
    "task-4": { id: "task-4", title: "Anna Kowalski" },
  },

  columns: {
    "col-1": {
      id: "col-1",
      title: "First Interview",
      taskIds: ["task-1", "task-2"],
    },
    "col-2": {
      id: "col-2",
      title: "Second Interview",
      taskIds: ["task-3", "task-4"],
    },
    "col-3": {
      id: "col-3",
      title: "Hired",
      taskIds: [],
    },
  },

  columnOrder: ["col-1", "col-2", "col-3"],
  isOnline: true,

  setOnline: (status) => set({ isOnline: status }),

  /**
   * WHY moveTask exists: Centralized drag-and-drop logic
   * 
   * HANDLES TWO CASES:
   * 1. Same column reorder: sourceTaskIds === destinationTaskIds (reference equality)
   * 2. Cross-column move: Two separate arrays
   * 
   * IMMUTABILITY PATTERN:
   * - Spread operator creates new arrays [...state.columns[fromCol].taskIds]
   * - splice() mutates the NEW array (not the original state)
   * - Return new columns object with updated taskIds
   * 
   * WHY THIS APPROACH:
   * - Single source of truth for all drag operations
   * - Prevents race conditions from multiple drag handlers
   * - Guarantees atomic state updates (either succeeds completely or not at all)
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

  addTask: (columnId, title) =>
    set((state) => {
      const taskId = `task-${Date.now()}`
      return {
        tasks: {
          ...state.tasks,
          [taskId]: { id: taskId, title },
        },
        columns: {
          ...state.columns,
          [columnId]: {
            ...state.columns[columnId],
            taskIds: [...state.columns[columnId].taskIds, taskId],
          },
        },
      }
    }),

  removeTask: (taskId) =>
    set((state) => {
      const newTasks = { ...state.tasks }
      delete newTasks[taskId]

      const newColumns = { ...state.columns }
      Object.keys(newColumns).forEach((colId) => {
        newColumns[colId] = {
          ...newColumns[colId],
          taskIds: newColumns[colId].taskIds.filter((id) => id !== taskId),
        }
      })

      return { tasks: newTasks, columns: newColumns }
    }),

  addColumn: (title) =>
    set((state) => {
      const columnId = `col-${Date.now()}`
      return {
        columns: {
          ...state.columns,
          [columnId]: { id: columnId, title, taskIds: [] },
        },
        columnOrder: [...state.columnOrder, columnId],
      }
    }),

  removeColumn: (columnId) =>
    set((state) => {
      const newColumns = { ...state.columns }
      const tasksToRemove = newColumns[columnId].taskIds
      delete newColumns[columnId]

      const newTasks = { ...state.tasks }
      tasksToRemove.forEach((taskId) => delete newTasks[taskId])

      return {
        tasks: newTasks,
        columns: newColumns,
        columnOrder: state.columnOrder.filter((id) => id !== columnId),
      }
    }),

  // Reorder columns
  reorderColumns: (fromIndex: number, toIndex: number) =>
    set((state) => {
      const newOrder = [...state.columnOrder]
      const [movedColumn] = newOrder.splice(fromIndex, 1)
      newOrder.splice(toIndex, 0, movedColumn)
      return { columnOrder: newOrder }
    }),
}))
