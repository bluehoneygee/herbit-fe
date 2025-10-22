"use client";

export default function DailyHabitsList({ items = [], loading = false }) {
  const limitedItems = Array.isArray(items) ? items.slice(0, 2) : [];

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((placeholder) => (
          <div
            key={placeholder}
            className="rounded-2xl border border-black/10 bg-white p-3 shadow-sm flex items-center animate-pulse"
          >
            <div className="mr-3 grid h-10 w-10 place-items-center rounded-2xl bg-gray-100" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded bg-gray-200" />
              <div className="h-2.5 w-20 rounded bg-gray-200" />
            </div>
            <div className="ml-3 h-9 w-9 rounded-2xl border border-black/10 bg-gray-100" />
          </div>
        ))}
      </div>
    );
  }

  if (!Array.isArray(items) || limitedItems.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/10 bg-white p-4 text-center text-sm text-gray-500 shadow-sm">
        Belum ada kebiasaan untuk hari ini.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {limitedItems.map((t) => {
        const done = Boolean(t?.done);
        return (
          <div
            key={t.id ?? t.title}
            className="rounded-2xl border border-black/10 bg-white p-3 shadow-sm flex items-center"
          >
            <div className="mr-3 grid h-10 w-10 place-items-center rounded-2xl bg-gray-100 text-lg">
              <span aria-hidden>{t.icon ?? "🌱"}</span>
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {t.title ?? "Tanpa judul"}
              </p>
              <p
                className={`text-xs ${
                  done ? "text-[#FEA800]" : "text-gray-500"
                }`}
              >
                {t.status ?? (done ? "Selesai" : "Belum dikerjakan")}
              </p>
            </div>

            <button
              type="button"
              aria-label={done ? "Sudah checklist" : "Checklist"}
              className={[
                "ml-3 h-9 w-9 rounded-2xl grid place-items-center border shadow-sm",
                done
                  ? "bg-[#FEA800] border-[#FEA800] text-white"
                  : "bg-white border-black/10 text-[#FEA800]",
              ].join(" ")}
            >
              {done ? "✓" : "+"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
