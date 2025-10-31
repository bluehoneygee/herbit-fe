"use client"
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

function toLocalFull(d) {
    if (!d) return "-";
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default function TimelineHeader({ startDate, harvestDate }) {
    return (
        <div className="space-y-4 pt-2">
            {/* Header Title and Back Button */}
            <div className="flex items-center gap-3">
                <Link href="/eco-enzyme">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-lg bg-white shadow-md hover:bg-gray-200 transition-transform hover:scale-[1.05]"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-extrabold text-gray-900">Timeline 90 Hari</h1>
            </div>

            <div className="rounded-2xl shadow-xl border border-gray-200 bg-white p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <div className="text-lg font-bold text-gray-800">Ringkasan Fermentasi</div>
                        <div className="space-y-1 text-sm">
                            <p className="text-gray-600">
                                Mulai: <span className="font-bold text-amber-500">{toLocalFull(startDate)}</span>
                            </p>
                            <p className="text-gray-600">
                                Panen: <span className="font-bold text-amber-500">{toLocalFull(harvestDate)}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}