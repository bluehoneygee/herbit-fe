"use client";

import Hint from "./Hint";

export default function HintsOverlay({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          w-full max-w-4xl px-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog" 
        aria-modal="true"
      >
        <Hint />
      </div>
    </div>
  );
}
