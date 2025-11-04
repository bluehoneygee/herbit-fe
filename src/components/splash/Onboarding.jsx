"use client";
import { useState } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

export default function Onboarding({ onStart, onSkip }) {
  const [i, setI] = useState(0);

  const slides = [
    {
      img: "/splashScreen/1.png",
      title: "Bersama, Kita Bisa Jaga Bumi",
      desc: "Herbit bantu perempuan memulai kebiasaan hijau dari hal sederhana karena perubahan besar berawal dari rumah.",
    },
    {
      img: "/splashScreen/2.jpg",
      title: "Mulai dari Rutinitas Kecilmu",
      desc: "Catat rutinitas ramah lingkunganmu setiap hari. Dapatkan poin untuk setiap langkah kecil menuju perubahan besar.",
    },
    {
      img: "/splashScreen/3.png",
      title: "Sekarang Giliran Kamu!",
      desc: "Ribuan perempuan sudah memulai. Sekarang giliranmu jadi bagian dari Herbit, kumpulkan poin, dan jaga bumi bareng-bareng.",
    },
  ];

  const next = () => setI((p) => Math.min(p + 1, slides.length - 1));

  return (
    <div className="h-dvh w-dvw overflow-hidden bg-[#FBE6C9] flex flex-col items-center justify-between">
      <div className="flex flex-col items-center justify-center flex-1 w-full pt-6">
        <div className="w-full max-w-[560px] aspect-[16/11] relative">
          <Image
            src={slides[i].img}
            alt=""
            fill
            className="object-contain select-none pointer-events-none"
            priority
          />
        </div>
      </div>

      <div className="w-full max-w-[640px] text-center pb-8 px-6">
        <h2 className="text-xl sm:text-2xl font-semibold">{slides[i].title}</h2>
        <p className="mt-2 text-sm text-gray-600">{slides[i].desc}</p>

        <div className="mt-4 flex justify-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === i ? "w-6 bg-[#ff8b0f]" : "w-2 bg-[#FBA94F]"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between w-full px-6 mt-6">
          <button
            onClick={onSkip}
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Skip
          </button>

          {i < slides.length - 1 ? (
            <button
              onClick={next}
              aria-label="Next"
              className="relative flex items-center justify-center w-12 h-12 rounded-full
                         bg-[#FFD369] border-2 border-[#FDBE45]
                         shadow-[0_0_0_4px_rgba(253,190,69,0.6)]
                         hover:bg-[#ffc632] transition"
            >
              <ChevronRight size={18} className="text-black" />
            </button>
          ) : (
            <button
              onClick={onStart}
              className="relative flex items-center justify-center w-12 h-12 rounded-full
                         bg-[#FFD369] border-2 border-[#FDBE45]
                         shadow-[0_0_0_4px_rgba(253,190,69,0.6)]
                         hover:bg-[#ffc632] transition"
            >
              <ChevronRight size={18} className="text-black" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
