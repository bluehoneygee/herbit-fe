"use client";

import { useEffect, useMemo, useState } from "react";

const AUTOPLAY_INTERVAL = 4000;

export default function RewardsBanner({ items = [], loading = false }) {
  const banners = useMemo(() => {
    if (!Array.isArray(items)) {
      return [];
    }
    return items.filter(Boolean);
  }, [items]);

  const [activeIndex, setActiveIndex] = useState(0);

  const hasMultiple = banners.length > 1;

  useEffect(() => {
    if (loading || !hasMultiple) {
      return;
    }

    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, AUTOPLAY_INTERVAL);

    return () => window.clearInterval(id);
  }, [banners.length, hasMultiple, loading]);

  useEffect(() => {
    if (loading) {
      return;
    }
    if (activeIndex >= banners.length) {
      setActiveIndex(0);
    }
  }, [banners.length, activeIndex, loading]);

  if (loading) {
    return (
      <div className="h-[92px] w-full rounded-2xl border border-white/40 bg-white/60 shadow-sm animate-pulse" />
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="relative select-none">
      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${activeIndex * 100}%)`,
            width: `${banners.length * 100}%`,
          }}
        >
          {banners.map((banner, index) => (
            <a
              key={banner.id ?? banner.name ?? `reward-banner-${index}`}
              href={banner.href ?? "#"}
              className="block w-full flex-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FEA800]"
            >
              <img
                src={banner.image}
                alt={banner.alt ?? "Rewards"}
                className="block h-[92px] w-full rounded-2xl object-cover"
              />
            </a>
          ))}
        </div>
      </div>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Banner sebelumnya"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/20 px-2 py-1 text-white transition hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FEA800]"
          >
            <span className="inline-block rotate-180 text-lg leading-none">
              ›
            </span>
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Banner berikutnya"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/20 px-2 py-1 text-white transition hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FEA800]"
          >
            <span className="inline-block text-lg leading-none">›</span>
          </button>
        </>
      )}

      {hasMultiple && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1">
          {banners.map((banner, index) => {
            const active = index === activeIndex;
            return (
              <button
                key={banner.id ?? `dot-${index}`}
                type="button"
                aria-label={`Lihat banner ${index + 1}`}
                aria-pressed={active}
                onClick={() => setActiveIndex(index)}
                className={[
                  "h-2 w-2 rounded-full transition",
                  active ? "bg-white border border-white" : "bg-white/50",
                ].join(" ")}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
