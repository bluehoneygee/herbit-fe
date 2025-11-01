"use client";
import Image from "next/image";
import ana from "@/assets/ana.png";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const LINES = [
  "Halo, aku Bu Ana 👩‍🦱.",
  "Ayo kita buang sampah di tempat yang tepat setiap hari.",
  "Pisahkan jadi 4: Organik, Daur Ulang, Kertas, dan Residu.",
  "Kebiasaan kecil bareng keluarga bikin rumah rapi dan lingkungan sehat!",
];

export default function DialogueScene({ className = "", onEnd }) {
  const [i, setI] = useState(0);
  const [shown, setShown] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [hopTick, setHopTick] = useState(0);
  const timer = useRef();
  const router = useRouter();

  useEffect(() => {
    setShown("");
    setIsTyping(true);
    clearInterval(timer.current);
    const chars = [...LINES[i]];
    let k = 0;
    timer.current = setInterval(() => {
      k++;
      setShown(chars.slice(0, k).join(""));
      if (k >= chars.length) {
        clearInterval(timer.current);
        setIsTyping(false);
      }
    }, 18);
    return () => clearInterval(timer.current);
  }, [i]);

  const next = () => {
    if (isTyping) {
      clearInterval(timer.current);
      setShown(LINES[i]);
      setIsTyping(false);
      return;
    }
    setHopTick((t) => t + 1);

    if (i < LINES.length - 1) setI(i + 1);
    else {
      router.push("/game/board");
    }
  };

  return (
    <div className={`relative h-full w-full ${className}`}>
      <motion.div
        key={hopTick}
        initial={{ x: 0 }}
        animate={{ x: [0, -5, 5, -2, 0] }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="absolute right-6 md:right-10 bottom-28 md:bottom-32 w-30 md:w-44 drop-shadow-[0_10px_30px_rgba(0,0,0,.35)] pointer-events-none"
      >
        <Image src={ana} alt="Ibu Ana" className="w-full h-auto" />
      </motion.div>

      {/* DIALOG BOX */}
      <div className="absolute left-4 right-4 bottom-4">
        <div className="rounded-2xl pixel pixel-btn neutral white backdrop-blur border shadow-lg p-5">
          <div className="inline-block mb-2">
            <span className="px-3 py-1 md:px-6 md:py-2 -top-6 absolute rounded-xl pixel pixel-btn sky font-bold tracking-wide">
              IBU ANA
            </span>
          </div>

          <p className="text-zinc-700 text-xs md:text-sm leading-relaxed select-none">
            {shown}
            {isTyping && <span className="animate-pulse">▋</span>}
          </p>

          <div className="mt-3 flex gap-4">
            <button
              onClick={() => setI(0)}
              className="px-4 rounded-lg border pixel-btn rose hover:bg-zinc-100 cursor-pointer"
            >
              Ulangi
            </button>
            <button
              onClick={next}
              className="px-4 rounded-lg bg-emerald-600 pixel-btn mint text-white font-semibold cursor-pointer"
            >
              {i < LINES.length - 1 ? "Lanjut →" : "Mulai Game →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
