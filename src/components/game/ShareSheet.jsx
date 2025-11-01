"use client";

export default function ShareSheet({
  open,
  onClose,
  sharing,
  onTwitter,
  onWhatsApp,
  onTelegram,
  onCopy,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 pixel" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="rounded-2xl bg-blue-200 shadow-xl border-7 border-blue-400 pixel p-6">
          <div className="mb-3 text-xl text-center text-slate-700 font-bold">
            {sharing ? "Menyiapkan konten..." : "Bagikan ke"}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onTwitter}
              disabled={sharing}
              className="pixel-btn black text-sm md:text-base"
            >
              X / Twitter
            </button>
            <button
              onClick={onTelegram}
              disabled={sharing}
              className="pixel-btn sky text-sm md:text-base"
            >
              Telegram
            </button>

            <button
              onClick={onWhatsApp}
              disabled={sharing}
              className="pixel-btn green text-sm md:text-base"
            >
              WhatsApp
            </button>
            <button
              onClick={onCopy}
              disabled={sharing}
              className="pixel-btn rose text-sm md:text-base"
            >
              Copy Text
            </button>

            <button onClick={onClose} className="pixel-btn red col-span-2 text-sm md:text-base">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
