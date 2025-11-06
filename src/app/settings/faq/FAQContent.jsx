"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function FAQContent({ items }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim().toLowerCase());
    }, 350);

    return () => clearTimeout(handler);
  }, [query]);

  const filteredItems = useMemo(() => {
    if (!debouncedQuery) return items;
    return items.filter(
      (item) =>
        item.question.toLowerCase().includes(debouncedQuery) ||
        item.answer.toLowerCase().includes(debouncedQuery)
    );
  }, [items, debouncedQuery]);

  return (
    <main className="min-h-screen bg-white text-[#0A0A19]">
      <header
        className="sticky top-0 z-30 bg-white px-4"
        style={{ paddingTop: "calc(24px + env(safe-area-inset-top))" }}
      >
        <div className="flex min-h-12 items-center justify-between py-4 bg-white">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm font-semibold text-gray-500 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15]/40"
          >
            Batal
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-base font-semibold text-[#0A0A19]">
              FAQ Herbit
            </h1>
          </div>
          <span className="w-16" aria-hidden="true" />
        </div>
      </header>

      <section className="px-4 pb-16 space-y-4">
        <div
          className="sticky z-20 bg-white pb-3"
          style={{
            top: "calc(72px + env(safe-area-inset-top))",
            paddingTop: "16px",
          }}
        >
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari pertanyaan (mis. daun kuning, poin, eco enzym)..."
            className="w-full rounded-xl bg-gray-100 px-4 py-2.5 text-sm text-[#0A0A19] placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FACC15]/40"
          />
        </div>

        {filteredItems.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-black/10 bg-white px-4 py-6 text-sm text-gray-500 shadow-sm">
            Belum ada jawaban untuk kata kunci tersebut. Coba istilah lain atau
            hubungi kami di{" "}
            <a
              href="mailto:support-herbit@gmail.com"
              className="font-semibold text-[#4A2D8B] underline"
            >
              tiyaland3@gmail.com
            </a>
            .
          </p>
        ) : (
          filteredItems.map((item, index) => (
            <details
              key={item.question}
              className="rounded-2xl border border-black/10 bg-white shadow-sm transition hover:border-[#FACC15]/60"
              open={index === 0}
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-4 text-sm font-semibold text-[#0A0A19]">
                <span>{item.question}</span>
                <span className="text-[#FEA800]">+</span>
              </summary>
              <p className="px-4 pb-4 text-sm leading-relaxed text-gray-600">
                {item.answer}
              </p>
            </details>
          ))
        )}

        {filteredItems.length > 0 && (
          <div className="mt-6 rounded-2xl border border-[#4A2D8B]/20 px-4 py-4 text-sm text-[#4A2D8B] shadow-sm">
            Masih ada pertanyaan? Hubungi tim kami di{" "}
            <a
              href="mailto:support-herbit@gmail.com"
              className="font-semibold underline"
            >
              tiyaland3@gmail.com
            </a>
            .
          </div>
        )}
      </section>
    </main>
  );
}
