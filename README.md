# 🎯 Kanban Board - Recruitment Pipeline

A modern Kanban board with drag-and-drop, offline protection, and smooth UI feedback.

![Kanban Demo](./demo.gif)

---

## ✨ Features

- 🎯 **Drag & Drop** – Tasks within/across columns, reorder columns
- 🎨 **Color-Coded** – 8-color soft palette with curved accents
- 🔌 **Offline Guard** – All actions blocked when offline + toast alerts
- ✅ **Completion Feedback** – Sound + green checkmark on last column
- ➕ **Add/Remove** – Tasks and columns on the fly

---

## 🛠️ Tech Stack

| Library | Why? |
|---------|------|
| **Zustand** | Minimal state management (~1KB), granular selectors |
| **@dnd-kit** | Modern drag-and-drop with accessibility |
| **Next.js 15** | App Router, React 19, TypeScript |
| **Tailwind CSS** | Utility-first styling with custom animations |

---

**Implementation:** Guard clause in `handleDragEnd` checks `isOnline` before any state mutations.

---

## � Library Choices

### State Management: **Zustand**
Chosen for its simplicity and performance:
- **Minimal Boilerplate** – No providers, no context wrapping
- **Size** – Only ~1KB gzipped vs Redux (3KB+)
- **Granular Selectors** – Components re-render only on relevant state changes
- **TypeScript Support** – Full type inference out of the box
- **Developer Experience** – Clean API with immutable updates built-in

```typescript
// Example: Only re-renders when isOnline changes
const isOnline = useKanbanStore((state) => state.isOnline)
```

### Drag-and-Drop: **@dnd-kit**
Modern, accessible drag-and-drop library:
- **Accessibility** – Built-in keyboard navigation and screen reader support
- **Performance** – Uses transform instead of position for smooth animations
- **Flexibility** – Handles both task movement and column reordering
- **Collision Detection** – `closestCenter` algorithm for intuitive drop zones
- **Activation Constraint** – 5px threshold prevents accidental drags

```typescript
// PointerSensor with constraint improves UX
useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
```

---

### Protection Mechanism
**Guard Clause Pattern** – Every mutating action checks `isOnline` first:

```typescript
const handleDragEnd = (event: DragEndEvent) => {
  if (!isOnline) {
    setShowDragBlockedToast(true)
    return // Block execution
  }
  // ... proceed with drag logic
}
```

### User Feedback
- ❌ Blocks drag, add, delete actions
- 🎨 Desaturates UI (opacity: 0.6)
- 💬 Toast notifications: "Connection lost: Action disabled"
- ✅ Auto-recovers when connection restored

---

## 📐 Data Structure

```typescript
tasks: Record<string, Task>      // O(1) lookup by ID
columns: Record<string, Column>  // O(1) access
columnOrder: string[]            // Explicit ordering
```

**Why Records?** O(1) performance vs O(n) with arrays - scales to 1000+ tasks.



## 📦 Setup

```bash
npm install
npm run dev
