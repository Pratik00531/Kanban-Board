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

## 🔌 Offline Handling

Listens to browser `online`/`offline` events:
- ❌ Blocks drag, add, delete actions
- 🎨 Desaturates UI
- 💬 Shows toast: "Connection lost: Action disabled"

**Implementation:** Guard clause in `handleDragEnd` checks `isOnline` before any state mutations.

---

## 📐 Data Structure

```typescript
tasks: Record<string, Task>      // O(1) lookup by ID
columns: Record<string, Column>  // O(1) access
columnOrder: string[]            // Explicit ordering
```

**Why Records?** O(1) performance vs O(n) with arrays - scales to 1000+ tasks.

---

## 📦 Setup

```bash
npm install
npm run dev
