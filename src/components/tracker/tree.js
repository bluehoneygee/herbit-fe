"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getLeaves, getFruits, claimFruit, getMe } from "@/lib/dailyTracker";
import { leafPositions } from "./leaf-positios";


export default function Tree() {
  const [leaves, setLeaves] = useState([]);
  const [fruits, setFruits] = useState([]);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showPointGain, setShowPointGain] = useState(false);
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

      setFruits((prev) =>
        prev.map((f) =>
          f.id === fruitId ? { ...f, isClaimed: true, pointsAwarded: awarded } : f
        )
      );

      setPoints(totalPoints);
      setMessage(`🎉 Kamu dapat ${awarded} poin!`);
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
    <main className="flex flex-col items-center font-sans py-8 mb-12">
      <h1 className="text-2xl font-bold text-green-700 mb-4">🌳 My Tree</h1>

      {/* total poin */}
      <div className="bg-gray-100 px-4 py-2 rounded-lg mb-3 text-lg font-medium">
        ⭐ Total Poin: <span className="font-bold">{points}</span>
        <AnimatePresence>
          {showPointGain && (
            <motion.span
              key="plus10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: -20 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.8 }}
              className="ml-2 text-green-500 font-bold"
            >
              +10
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {message && (
        <div className="bg-green-100 px-4 py-2 rounded-md text-green-700 font-semibold mb-3">
          {message}
        </div>
      )}

      {/* tampilan pohon */}
      <div className="relative w-[300px] h-[400px] flex items-center justify-center bg-green-100 rounded-xl shadow-inner overflow-hidden">
        <Image
          src="/tree-assets/pohon.png"
          alt="Pohon"
          fill
          className="object-contain pointer-events-none"
          priority
        />

        {/* daun animasi */}
        {leaves.map((leaf, index) => {
          const pos = leafPositions[index % leafPositions.length];
          const rotation = (index * 37 + 15) % 360;
          const size = 20 + (index * 5) % 8;

          return (
            <motion.div
              key={leaf.id}
              className="absolute"
              style={{
                left: `${pos.x*1.1-4.5}%`,
                top: `${pos.y*0.9+1}%`,
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

        {/* buah animasi */}
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
                  pointerEvents: "auto",
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
                {!isReady }
              </motion.div>
            );
          })}
      </AnimatePresence>

      </div>

      <button
        onClick={fetchTreeData}
        className="mt-4 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white"
      >
        🔄 Refresh Tree
      </button>
    </main>
  );
}
