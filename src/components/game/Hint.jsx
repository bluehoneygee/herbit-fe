"use client";

import trashData from "@/data/trash";
import { useMemo, useState } from "react";

const CAT_INFO = {
  green: {
    label: "Hijau (Organik)",
    chip: "bg-emerald-500",
    note: "Sisa makanan & daun. Cepat busuk, jadi pisahkan ya.",
  },
  yellow: {
    label: "Kuning (Plastik/Kaca)",
    chip: "bg-yellow-400",
    note: "Bersihkan dulu biar gampang didaur ulang.",
  },
  blue: {
    label: "Biru (Logam)",
    chip: "bg-sky-500",
    note: "Kaleng & logam ringan. Hancurkan/penyet kalau bisa.",
  },
  red: {
    label: "Merah (B3)",
    chip: "bg-rose-500",
    note: "Berbahaya (baterai, elektronik kecil). Jangan campur!",
  },
};

const BG_BY_ID = {
  all: "bg-white/80 hover:bg-white text-stone-900", // “Semua”
  green: "bg-emerald-200 hover:bg-emerald-300 text-emerald-900",
  yellow: "bg-yellow-200  hover:bg-yellow-300  text-yellow-900",
  blue: "bg-sky-200    hover:bg-sky-300     text-sky-900",
  red: "bg-rose-200   hover:bg-rose-300    text-rose-900",
};

const BIN_TIPS = {
  green: {
    title: "🟢 Tong Hijau — Organik",
    desc: "Sisa makanan & bahan alami yang cepat terurai. Ideal buat kompos. Hindari campur plastik/kaca/logam.",
    tone: "green",
  },
  yellow: {
    title: "🟡 Tong Kuning — Daur Ulang (Plastik/Kertas/Kain)",
    desc: "Plastik, kertas, kain yang masih layak proses ulang. Wajib dibilas/bersih biar gak kontaminasi.",
    tone: "yellow",
  },
  blue: {
    title: "🔵 Tong Biru — Logam & Kaca",
    desc: "Kaleng, besi ringan, botol/toples kaca. Bersihkan dulu; bahan ini dilebur/diolah ulang.",
    tone: "sky",
  },
  red: {
    title: "🔴 Tong Merah — B3/Residu Berbahaya",
    desc: "Baterai, obat, elektronik, popok, oli, lampu. Butuh penanganan khusus—jangan campur dengan lain.",
    tone: "rose",
  },
};

const TIP_STYLE = {
  green:
    "bg-emerald-50 border-emerald-200 text-emerald-800 [&_strong]:text-emerald-900",
  yellow:
    "bg-yellow-50 border-yellow-200 text-yellow-900 [&_strong]:text-yellow-900",
  sky: "bg-sky-50 border-sky-200 text-sky-800 [&_strong]:text-sky-900",
  rose: "bg-rose-50 border-rose-200 text-rose-800 [&_strong]:text-rose-900",
};

const FILTERS = [
  { id: "all", label: "Semua" },
  { id: "green", label: "Hijau" },
  { id: "yellow", label: "Kuning" },
  { id: "blue", label: "Biru" },
  { id: "red", label: "Merah" },
];

export default function Hint({ onClose }) {
  const [filter, setFilter] = useState("all");

  const list = useMemo(
    () =>
      filter === "all"
        ? trashData
        : trashData.filter((t) => t.category === filter),
    [filter]
  );
  const [selected, setSelected] = useState(list[0] ?? trashData[0]);

  useMemo(() => {
    if (!list.find((x) => x.id === selected?.id))
      setSelected(list[0] ?? trashData[0]);
  }, [filter]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="w-[90vw] max-w-[900px] max-h-[85vh] overflow-auto
               rounded-2xl pixel pixel-background blue border shadow-xl
               p-3 sm:p-4 md:p-6"
      >
        <h1 className="text-base sm:text-lg md:text-xl mb-3 text-center">
          HINTS
        </h1>

        <div className="flex gap-3 sm:gap-4">
          {/* FILTER BUTTONS */}
          <div className="hidden md:flex md:flex-col gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm border transition
              ${
                filter === f.id
                  ? "bg-white shadow font-semibold text-stone-900"
                  : BG_BY_ID[f.id] || BG_BY_ID.all
              }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* GRID LIST */}
          <div className="flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 pr-1 md:pr-4 max-h-[300px] sm:max-h-[320px] overflow-y-auto">
              {list.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className={`group rounded-lg sm:rounded-xl border bg-white p-2 sm:p-3 text-left transition
                ${
                  selected?.id === item.id
                    ? "ring-2 ring-yellow-400 border-4 border-yellow-200"
                    : "hover:shadow"
                }`}
                >
                  <div className="w-full aspect-square grid place-items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="max-h-14 sm:max-h-20 object-contain"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs font-semibold text-stone-700 truncate">
                      {item.name}
                    </span>
                    <span
                      className={`inline-block w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full ${
                        CAT_INFO[item.category].chip
                      }`}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* DESKTOP */}
          <div className="hidden md:block w-[260px] shrink-0">
            {selected && <DetailCard item={selected} activeFilter={filter} />}
          </div>
        </div>

        {/* MOBILE */}
        <div className="md:hidden mt-3">
          {selected && <DetailCard item={selected} activeFilter={filter} />}
        </div>
      </div>
    </div>
  );
}

function DetailCard({ item, activeFilter }) {
  const effectiveCat = activeFilter !== "all" ? activeFilter : item.category;
  const info = CAT_INFO[item.category];
  const tip = BIN_TIPS[effectiveCat];

  return (
    <div className="rounded-xl sm:rounded-2xl bg-white border-2 sm:border-4 border-yellow-400 p-3 sm:p-4">
      {tip && (
        <div
          className={`mt-2 sm:mt-3 rounded-lg border p-2 sm:p-2.5 text-[11px] sm:text-xs ${
            TIP_STYLE[tip.tone]
          }`}
        >
          <strong className="block mb-0.5">{tip.title}</strong>
          <span className="opacity-90">{tip.desc}</span>
        </div>
      )}
      <div className="flex items-center gap-3 mt-5">
        <div className="w-12 sm:w-16 h-12 sm:h-16 grid place-items-center rounded-lg sm:rounded-xl bg-green-200 border">
          <img
            src={item.image}
            alt={item.name}
            className="max-h-10 sm:max-h-12 object-contain"
          />
        </div>
        <div>
          <div className="text-stone-800 font-semibold sm:font-bold text-sm sm:text-base">
            {item.name}
          </div>
          <div className="text-[10px] sm:text-xs text-stone-500 flex items-center gap-1.5 sm:gap-2">
            <span
              className={`inline-block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${info.chip}`}
            />
            {info.label}
          </div>
        </div>
      </div>

      <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-stone-700 leading-snug">
        {item.reason}
      </p>
    </div>
  );
}
