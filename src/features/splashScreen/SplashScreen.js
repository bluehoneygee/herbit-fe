"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const slides = [
  {
    title: "Bingung Sampah Organik Rumah Tangga Mau Diapain?",
    body: "Sisa dapur bukan sekadar sampah! Kita, para ibu rumah tangga, bisa ubah sampah dapur jadi ecoenzim yang bermanfaat.",
    img: "/splashScreen/1.jpg",
  },
  {
    title: "Setiap Aksi Kecilmu Sangat Berarti",
    body: "Dari tantangan sederhana lahir perubahan besar. Selesaikan misi harianmu, kumpulkan poin, dan raih hadiah!",
    img: "/splashScreen/2.jpg",
  },
  {
    title: "Siap Jadi Eco Warrior?",
    body: "Ribuan perempuan sudah memulai. Giliran kamu! Yuk, mulai perjalanan ramah lingkunganmu hari ini.",
    img: "/splashScreen/3.jpg",
  },
];

export default function SplashScreen({ onFinish }) {
  const [idx, setIdx] = useState(0);
  const last = slides.length - 1;
  const ref = useRef(null);

  // update active dot when user swipes / scrolls
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const i = Math.round(el.scrollLeft / el.clientWidth);
      setIdx(i);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (i) => {
    const el = ref.current;
    if (!el) return;
    const next = Math.max(0, Math.min(i, last));
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    setIdx(next);
  };

  const next = () => (idx === last ? onFinish?.() : goTo(idx + 1));
  const skip = () => onFinish?.();

  return (
    <div className="w-full min-h-dvh grid place-items-center py-6">
      {/* Phone-looking frame centered on desktop */}
      <div className="relative w-[380px] max-w-[92vw] h-[760px] max-h-[92dvh] bg-white rounded-phone shadow-phone border border-neutral-200 overflow-hidden">
        <div style={{ height: "var(--safe-top)" }} />

        {/* Carousel */}
        <div
          ref={ref}
          className="h-full w-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth"
        >
          {slides.map((s, i) => (
            <section
              key={i}
              className="snap-start shrink-0 w-full h-full flex flex-col"
            >
              <div className="px-8 pt-8">
                <div className="relative w-full aspect-[1/0.75]">
                  <Image
                    src={s.img}
                    alt={s.title}
                    fill
                    className="object-contain"
                    priority={i === 0}
                  />
                </div>
              </div>

              <div className="mt-4 px-8">
                <h2 className="text-xl font-semibold leading-snug">
                  {s.title}
                </h2>
                <p className="text-sm text-neutral-600 mt-3">{s.body}</p>
              </div>

              <div className="mt-auto px-6 pb-6">
                {/* dots */}
                <div className="flex items-center justify-center gap-2 my-3">
                  {slides.map((_, d) => (
                    <button
                      key={d}
                      aria-label={`slide ${d + 1}`}
                      onClick={() => goTo(d)}
                      className={`h-2 rounded-full transition-all ${
                        idx === d ? "w-6 bg-brand-600" : "w-2 bg-neutral-300"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={skip}
                    className="text-sm text-neutral-500 hover:text-neutral-700"
                  >
                    Skip
                  </button>

                  <button
                    onClick={next}
                    className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-neutral-200 shadow-sm hover:shadow md:active:scale-95 transition"
                    aria-label={idx === last ? "Mulai" : "Lanjut"}
                  >
                    <span className="sr-only">
                      {idx === last ? "Mulai" : "Lanjut"}
                    </span>
                    {/* simple arrow */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M8 5l8 7-8 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
