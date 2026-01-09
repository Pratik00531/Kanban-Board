"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface TaskCardProps {
  id: string
  title: string
  isOnline: boolean
}

export function TaskCard({ id, title, isOnline }: TaskCardProps) {
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
