"use client"

import dynamic from "next/dynamic"
// Dynamically import KanbanBoard with SSR disabled

const KanbanBoard = dynamic(
  () => import("@/components/KanbanBoard").then((mod) => ({ default: mod.KanbanBoard })),
  { ssr: false }
)

// Main page component
//This page hosts the KanbanBoard component which is in components/KanbanBoard.tsx
// Let's go to that file to see the main logic of the app.
export default function Page() {
  return <KanbanBoard />
}

