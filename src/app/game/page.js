"use client";
import { useState } from "react";
import Image from "next/image";
import bg from "@/assets/bg.jpg";
import DialogueScene from "@/components/game/DialogueScene";
import SplitText from "@/components/game/SplitText";
import TargetCursor from "@/components/game/TargetCursor";
import { useRouter } from "next/navigation";

export default function Game() {
  const [screen, setScreen] = useState("splash"); // "splash" | "dialogue" | "board"
  const router = useRouter();
  const handleAnimationComplete = () => {
  };

  return (
    <main className="fixed inset-0 h-dvh w-dvw overflow-hidden">
      <div className="relative h-full w-full">
        <Image
          src={bg}
          alt="forest"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />

        {screen === "splash" && (
          <div className="absolute inset-0 flex flex-col justify-center items-center pb-12 z-10">
            <h1 className="text-3xl font-extrabold text-white drop-shadow md:mb-6 mb-3">
              <SplitText
                text="WELCOME!"
                className="text-4xl md:text-6xl font-semibold text-center pixel text-black"
                delay={100}
                duration={0.6}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-100px"
                textAlign="center"
                onLetterAnimationComplete={handleAnimationComplete}
              />
            </h1>
            <TargetCursor spinDuration={2} hideDefaultCursor={true} />
            <button
              onClick={() => setScreen("dialogue")}
              className="cursor-target pixel pixel-btn yellow cursor-pointer select-none mt-2"
            >
              Ayo Mainkan
            </button>
            <button
              onClick={() => router.replace("/")}
              className="cursor-target pixel pixel-btn red cursor-pointer select-none mt-6"
            >
              Kembali ke Home
            </button>
          </div>
        )}

        {screen === "dialogue" && (
          <DialogueScene
            className="absolute inset-0 z-10"
            onEnd={() => setScreen("board")}
          />
        )}
      </div>
    </main>
  );
}
