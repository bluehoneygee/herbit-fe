"use client";

import { useDraggable } from "@dnd-kit/core";

export default function Trash({ item, style, isShaking }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
    data: { category: item.category },
  });
  const t = transform ? `translate3d(${transform.x}px, ${transform.y}px,0)` : undefined;

  return (
    <img
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      src={item.image}
      alt={item.name}
      draggable={false}
      className={`absolute z-20 w-16 h-16 cursor-grab active:cursor-grabbing select-none touch-none ${
        isShaking ? "animate-[bin-wiggle_.35s_ease]" : ""
      }`}
      style={{ ...style, transform: t, transformOrigin: "50% 50%" }}
    />
  );
}
