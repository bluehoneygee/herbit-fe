"use client";

import { useDroppable } from "@dnd-kit/core";

export default function Bin({ id, src, label, width = "w-20 sm:w-24 md:w-26 lg:w-28", isShaking = false }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`relative ${width} select-none ${isShaking ? "animate-[bin-wiggle_.35s_ease]" : ""}`}
      style={{ transformOrigin: "50% 80%" }}
      aria-label={label}
    >
      <img src={src} alt={label} draggable={false} className="block w-full h-auto pointer-events-none" />
    </div>
  );
}
