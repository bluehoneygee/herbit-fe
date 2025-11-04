"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getLeaves, getFruits, claimFruit, getMe } from "@/lib/taskTracker";
import { leafPositions } from "./leaf-positios";
import FruitProgress from "./fruitProgress";
import SaveYellowLeaves from "./saveYellowLeaves";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Tree() {
  const [leaves, setLeaves] = useState([]);
  const [fruits, setFruits] = useState([]);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showPointGain, setShowPointGain] = useState(false);
  const [profileHref, setProfileHref] = useState(null);
  const pointRef = useRef(null);

  useEffect(() => {
    fetchTreeData();
  }, []);

  const fetchTreeData = async () => {
    try {
      const [leafRes, fruitRes, meRes] = await Promise.all([
        getLeaves(),
        getFruits(),
        getMe(),
      ]);

      const leafData = leafRes.data.leaves || [];
      const fruitData = fruitRes.data.fruits || [];
      const userData = meRes.data.data || {};

      const totalPoints = userData.totalPoints || 0;
      const username = userData.username || userData.slug || null;

      const mappedLeaves = leafData.map((leaf) => ({
        id: leaf._id,
        checklistId: leaf.dailyTaskChecklistId,
        status: leaf.status,
      }));

      const uniqueLeaves = mappedLeaves.filter(
        (leaf, index, self) =>
          index === self.findIndex((l) => l.checklistId === leaf.checklistId)
      );

      const mappedFruits = fruitData.map((fruit, index) => {
        const pos = leafPositions[index % leafPositions.length];
        const createdAt = fruit.createdAt ? new Date(fruit.createdAt) : new Date();
        const harvestReadyDate = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

        return {
          id: fruit._id,
          isClaimed: fruit.isClaimed,
          pointsAwarded: fruit.pointsAwarded,
          harvestReadyDate,
          x: pos.x,
          y: pos.y,
        };
      });

      setLeaves(uniqueLeaves);
      setFruits(mappedFruits);
      setPoints(totalPoints);
      if (username) setProfileHref(`/${username}/rewards`);
    } catch (err) {
      console.error("Error fetching tree data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimFruit = async (fruitId) => {
    try {
      const res = await claimFruit(fruitId);
      const awarded = res.data.pointsAwarded || 0;

      const meRes = await getMe();
      const userData = meRes.data.data || {};
      const totalPoints = userData.totalPoints || 0;
      const username = userData.username || userData.slug || null;

      setFruits((prev) =>
        prev.map((f) =>
          f.id === fruitId ? { ...f, isClaimed: true, pointsAwarded: awarded } : f
        )
      );

      setPoints(totalPoints);
      if (username) setProfileHref(`/${username}/rewards`);
      setShowPointGain(true);
      setTimeout(() => {
        setMessage("");
        setShowPointGain(false);
      }, 1500);
    } catch (err) {
      console.error("Error claiming fruit:", err);
      setMessage("❌ Gagal klaim buah");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  if (loading) return <p className="text-center">Loading tree...</p>;

  return (
    <main className="flex flex-col font-sans">
      {/* Sticky Header (gabungan dari YourTree + header poin) */}
      <header
        className="sticky top-0 z-20 bg-white px-4 pb-4 backdrop-blur"
        style={{ paddingTop: "calc(24px + env(safe-area-inset-top))" }}
      >
        {/* Tombol kembali + judul */}
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="h-11 w-11 rounded-2xl border border-black/10 bg-white shadow-sm flex items-center justify-center transition-transform duration-150 active:scale-95"
            aria-label="Kembali"
          >
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </button>

          <span className="text-xl font-bold text-gray-900">Progress Pohonmu</span>
        </div>

        {/* Poin + tombol Rewards */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center">
            <span className="text-[#FEA800] font-semibold text-sm">
              🏅 {points} Points
            </span>

            <AnimatePresence>
              {showPointGain && (
                <motion.span
                  key="plus10"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: -20 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.8 }}
                  className="ml-2 text-[#FEA800] font-bold"
                >
                  +10
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {profileHref ? (
            <Link href={profileHref}>
              <Button className="bg-violet-600 hover:bg-violet-700 text-white font-semibold flex items-center shadow-md transition-transform duration-150 active:scale-95 w-full sm:w-auto">
                Rewards and Vouchers
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button
              disabled
              className="bg-violet-300 text-white font-semibold flex items-center shadow-md w-full sm:w-auto"
            >
              Rewards and Vouchers
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Subjudul */}
        <div className="text-center mt-3">
          <p className="text-base text-amber-700 font-medium">
            Panen Buah dan Dapatkan Poin!
          </p>
        </div>
      </header>

      {/* Tampilan pohon */}
      <div className="flex justify-center items-center">
        <div className="relative w-[300px] h-[300px] flex items-center justify-center">
          <Image
            src="/tree-assets/pohon.png"
            alt="Pohon"
            fill
            className="object-contain pointer-events-none"
            priority
          />

          {/* Daun */}
          {leaves.map((leaf, index) => {
            const pos = leafPositions[index % leafPositions.length];
            const rotation = (index * 37 + 15) % 360;
            const size = 20 + (index * 5) % 8;

            return (
              <motion.div
                key={leaf.id}
                className="absolute"
                style={{
                  left: `${pos.x * 1.1 - 4.5}%`,
                  top: `${pos.y * 0.9}%`,
                  transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                }}
                initial={{ opacity: 0, scale: 0.3, rotate: rotation - 30 }}
                animate={{ opacity: 1, scale: 1, rotate: rotation }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 100,
                }}
              >
                <Image
                  src={
                    leaf.status === "green"
                      ? "/tree-assets/daun-hijau.png"
                      : "/tree-assets/daun-kuning.png"
                  }
                  alt="Leaf"
                  width={size}
                  height={size}
                />
              </motion.div>
            );
          })}

          {/* Buah */}
          <AnimatePresence>
            {fruits
              .filter((fruit) => !fruit.isClaimed)
              .map((fruit) => {
                const now = new Date();
                const isReady = now >= new Date(fruit.harvestReadyDate);

                return (
                  <motion.div
                    key={fruit.id}
                    className="absolute cursor-pointer"
                    style={{
                      left: `${fruit.x}%`,
                      top: `${fruit.y}%`,
                      opacity: isReady ? 1 : 0.7,
                    }}
                    onClick={() => {
                      if (isReady) {
                        handleClaimFruit(fruit.id);
                      } else {
                        setMessage("🍏 Ups, kamu bisa panen buah ini besok ya!");
                        setTimeout(() => setMessage(""), 2000);
                      }
                    }}
                    animate={{
                      scale: [1, 1.05, 1],
                      y: [0, -3, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      repeatType: "mirror",
                      duration: 2,
                      ease: "easeInOut",
                    }}
                    exit={{
                      scale: 0,
                      opacity: 0,
                      transition: { duration: 0.3 },
                    }}
                  >
                    <Image
                      src="/tree-assets/buah.png"
                      alt="Buah"
                      width={28}
                      height={28}
                    />
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>
      </div>

      {/* Pesan notifikasi */}
      {message && (
        <div className="bg-[#FEA800]/10 px-1 py-1 rounded-md text-amber-700 font-semibold text-center">
          {message}
        </div>
      )}

      {/* Komponen tambahan */}
      <div className="mt-4 mx-4">
        <FruitProgress leaves={leaves} />
      </div>
      <div className="mt-4 mx-4">
        <SaveYellowLeaves leaves={leaves} />
      </div>
    </main>
  );
}
