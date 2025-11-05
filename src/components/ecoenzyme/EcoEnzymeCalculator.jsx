// src/components/ecoenzyme/EcoEnzymeCalculator.jsx
"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Info } from "lucide-react";

const JournalSection = ({ journalEntries = [], isFermentationActive, newEntry, setNewEntry, addEntry, totalWeightKg = 0, resetAll }) => (
    <Card className="lg:col-span-1 transition-shadow duration-300 hover:shadow-xl hover:scale-[1.02]">
        <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-2 text-gray-800 text-center">Jurnal Sampah Organik</h3>
            <p className="text-sm text-gray-500 mb-4 text-center">Catat sampah organikmu</p>
            {isFermentationActive ? (
                <div className="p-3 bg-amber-100 border border-amber-200 text-amber-800 rounded-lg mb-4 text-sm flex items-start gap-2">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="flex-grow">Fermentasi sudah berjalan. Tidak bisa menambah sampah baru.</span>
                </div>
            ) : (
                <form onSubmit={addEntry} className="grid grid-cols-2 gap-3 mb-4 items-center">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="new-entry" className="text-sm text-gray-700 font-medium">Berat hari ini (Kg)</label>
                        <Input id="new-entry" type="number" step="0.01" value={newEntry} onChange={(e) => setNewEntry(e.target.value)} placeholder="0.00" className="border-amber-300 focus:ring-amber-500" />
                    </div>
                    <div className="flex justify-end self-end"> 
                        <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white h-10 shadow-md">
                            <Plus className="w-4 h-4 mr-1" /> Tambah
                        </Button>
                    </div>
                </form>
            )}
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">Total terkumpul: <b>{Number(totalWeightKg || 0).toFixed(2)} Kg</b></p>
                <Button
                    onClick={resetAll}
                    variant="ghost"
                    size="sm"
                    className={`text-red-500 hover:text-red-600 ${isFermentationActive ? "opacity-60 cursor-not-allowed" : ""}`}
                    disabled={isFermentationActive}
                >
                    <Trash2 className="w-4 h-4 mr-1"/> Reset
                </Button>
            </div>
            <ul className="divide-y max-h-48 overflow-y-auto border rounded-md">
                {journalEntries.map((e) => {
                    const weightKg = (() => {
                        if (typeof e?.weightKg === "number") {
                            return e.weightKg;
                        }

                        if (typeof e?.weight === "number") {
                            return Number(e.weight) / 1000;
                        }

                        if (typeof e?.prePointsEarned === "number") {
                            return Number(e.prePointsEarned) / 10;
                        }

                        const parsed = Number(e?.prePointsEarned ?? 0);
                        return Number.isFinite(parsed) ? parsed / 10 : 0;
                    })();

                    return (
                        <li key={e.id} className="py-2 px-3 flex justify-between items-center hover:bg-gray-50">
                            <span className="text-gray-700 text-sm">{e.date}:</span>
                            <div className="flex items-center gap-2">
                                <b className="text-sm">{weightKg.toFixed(2)} Kg</b>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </CardContent>
    </Card>
);

const RecipeSection = ({ totalWeightKg = 0, gula = 0, air = 0, isFermentationActive, startFermentation }) => (
    <Card className="lg:col-span-1 transition-shadow duration-300 hover:shadow-xl hover:scale-[1.02]">
        <CardContent className="p-6 h-full flex flex-col justify-between">
            <div>
                <h3 className="text-lg font-bold mb-4 text-gray-800 text-center">Kebutuhan Resep (3:1:10)</h3>
                <div className="grid grid-cols-3 text-center gap-4 border p-4 rounded-lg bg-gray-50">
                    <div>
                        <p className="text-sm text-gray-500">Sampah</p>
                        <p className="text-xl font-bold text-gray-800">{Number(totalWeightKg || 0).toFixed(2)} Kg</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Gula</p>
                        <p className="text-xl font-bold text-gray-800">{Number(gula || 0).toFixed(2)} Kg</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Air</p>
                        <p className="text-xl font-bold text-gray-800">{Number(air || 0).toFixed(2)} L</p>
                    </div>
                </div>
            </div>

            {!isFermentationActive && Number(totalWeightKg || 0) > 0 && (
                <Button onClick={startFermentation} className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 mt-4">
                    Mulai Fermentasi
                </Button>
            )}
        </CardContent>
    </Card>
);

const TimerSection = ({ daysRemaining, harvestDate, resetAll }) => (
    <Card className="lg:col-span-1 transition-shadow duration-300 hover:shadow-xl hover:scale-[1.02]">
        <CardContent className="p-6 text-center h-full flex flex-col justify-center">
            {harvestDate ? (
                <div className="py-4">
                    <h3 className="font-bold text-gray-800 text-lg mb-2">Fermentasi Sedang Berjalan</h3>
                    <p className="text-5xl font-extrabold text-amber-600">{Number(daysRemaining || 0)}</p>
                    <p className="text-base text-gray-500 mb-3">Hari Tersisa</p>
                    <p className="text-sm text-gray-700">
                        Target Panen: {new Date(harvestDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <div className="flex justify-center">
                        <Button
                            onClick={resetAll}
                            className="mt-4 bg-red-500 hover:bg-red-600 text-white"
                        >
                            <Trash2 className="w-4 h-4 mr-1"/> Reset Data
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="text-gray-500 py-6">Tekan 'Mulai Fermentasi' di kolom resep setelah sampah terkumpul.</div>
            )}
        </CardContent>
    </Card>
);

export default function EcoEnzymeCalculator({ tracker = {} }) {
    return (
        <>
            <JournalSection 
                journalEntries={tracker.journalEntries || []}
                isFermentationActive={tracker.isFermentationActive}
                newEntry={tracker.newEntry}
                setNewEntry={tracker.setNewEntry}
                addEntry={tracker.addEntry}
                totalWeightKg={tracker.totalWeightKg}
                resetAll={tracker.resetAll}
            />
            <RecipeSection
                totalWeightKg={tracker.totalWeightKg}
                gula={tracker.gula}
                air={tracker.air}
                isFermentationActive={tracker.isFermentationActive}
                startFermentation={tracker.startFermentation}
            />
            <TimerSection
                daysRemaining={tracker.daysRemaining}
                harvestDate={tracker.harvestDate}
                resetAll={tracker.resetAll}
            />
        </>
    );
}
