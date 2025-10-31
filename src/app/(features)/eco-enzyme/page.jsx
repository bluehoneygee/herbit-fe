"use client";

import React from "react";
import useEcoEnzymeTracker from "@/hooks/useEcoEnzymeTracker";
import EcoEnzymeCalculator from "@/components/ecoenzyme/EcoEnzymeCalculator";
import EcoEnzymeProgress from "@/components/ecoenzyme/EcoEnzymeProgress";
import EcoEnzymeSteps from "@/components/ecoenzyme/EcoEnzymeSteps";
import TimelineProgressCard from "@/components/ecoenzyme/timeline/TimelineProgressCard"; 
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ChatButton from "@/components/floating-chat/ChatButton";
import Link from "next/link";

export default function EcoEnzymePage() {
    const tracker = useEcoEnzymeTracker();

    return (
        <main className="min-h-screen bg-white-50 p-4 sm:p-6 lg:py-8 lg:px-8 pb-24">
            <div className="w-full mx-auto">
                {/* Header */}
                <div className="flex flex-col gap-2 pb-6 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-lg w-10 h-10 bg-white shadow-md hover:bg-gray-50 p-0 transition-transform duration-150 active:scale-95"
                            onClick={() => window.history.back()}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-3xl font-bold text-gray-900">Eco Enzyme</h1>
                    </div>

                    {/* Link ke timeline */}
                    <Link
                        href="/eco-enzyme/timeline"
                        passHref
                        className="ml-14 w-full sm:w-auto mt-1 flex-shrink-0"
                    >
                        <Button className="bg-violet-600 hover:bg-violet-700 text-white font-semibold flex items-center shadow-md transition-transform duration-150 active:scale-95 w-full sm:w-auto">
                            Lihat Timeline <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>

                    <p className="text-base text-amber-700 font-medium ml-14 mt-1">
                        Yuk Ubah Sampah Dapur Jadi Cairan Ajaib 🌱
                    </p>
                </div>

                {/* Progress Lingkaran */}
                <EcoEnzymeProgress
                    isFermentationActive={tracker.isFermentationActive}
                    totalWeightKg={tracker.totalWeightKg}
                    daysCompleted={tracker.daysCompleted}
                    daysRemaining={tracker.daysRemaining}
                    progressPct={tracker.progressPct}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <EcoEnzymeCalculator tracker={tracker} />
                </div>

                <EcoEnzymeSteps />
                <ChatButton />
            </div>
        </main>
    );
}
