"use client"
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, Users } from 'lucide-react';
import DayItem from './DayItem'; // Impor DayItem


function toLocalShort(d) {
    if (!d) return "-";
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function MonthSection({ 
    month = 1, 
    summary = { start: 0, end: 0, total: 0, done: 0, pct: 0 }, 
    monthWeeks = [], 
    startDate = null, 
    currentDayIndex = 0, 
    photos = {}, 
    handleCheckin = () => {}, 
    handlePhotoUpload = () => {},
    openWeeks = new Set(),
    setOpenWeeks = () => {},
    activeWeekIndex = 0
}) {
    const safeSummary = summary && typeof summary === "object"
        ? summary
        : { start: 0, end: 0, total: 0, done: 0, pct: 0 };

    const safeWeeks = Array.isArray(monthWeeks) ? monthWeeks : [];
    const safePhotos = photos && typeof photos === "object" ? photos : {};
    const weekSet = openWeeks instanceof Set ? openWeeks : new Set();

    if (!safeWeeks.length) {
        return null;
    }
    
    const accentColor = month === 1 ? 'bg-blue-600' : month === 2 ? 'bg-purple-600' : 'bg-green-600';
    const accentLightColor = month === 1 ? 'bg-blue-50' : month === 2 ? 'bg-purple-50' : 'bg-green-50';
    const accentTextColor = month === 1 ? 'text-blue-700' : month === 2 ? 'text-purple-700' : 'text-green-700';
    const iconBgClass = month === 1 ? 'bg-blue-500' : month === 2 ? 'bg-purple-500' : 'bg-green-500';

    const dayDateFromStart = (startDate, dayIndex) => {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + (dayIndex - 1));
        d.setHours(0, 0, 0, 0);
        return d;
    };
    
    return (
        <section>
            <Card className="rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <CardContent className={`p-5 ${accentLightColor} border-b-2 border-gray-100`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${iconBgClass} text-white font-extrabold text-xl shadow-md transition-transform duration-300 hover:rotate-6`}>
                                <Users className="w-7 h-7"/>
                            </div>
                            <div>
                                <div className={`text-xl font-extrabold ${accentTextColor}`}>Fase Bulan {month}</div>
                                <div className="text-sm text-gray-600">Hari {safeSummary.start} ({startDate ? toLocalShort(dayDateFromStart(startDate, safeSummary.start)) : "-"}) - {safeSummary.end}</div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <div className="text-base font-bold text-gray-800">
                                {safeSummary.done}/{safeSummary.total} Hari
                            </div>
                            <div className="w-36">
                                <div className="w-full bg-gray-300 rounded-full h-2.5 overflow-hidden">
                                    <div 
                                        className={`h-2.5 ${accentColor} transition-all duration-1000 ease-out`} 
                                        style={{ width: `${safeSummary.pct || 0}%` }} 
                                    />
                                </div>
                                <div className="text-xs text-right text-gray-600 mt-1 font-bold">{safeSummary.pct || 0}%</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
                
                <div className="p-4 bg-white space-y-3"> 
                    {safeWeeks.map((w) => {
                        const idx = w.weekIndex ?? 0;
                        const opened = weekSet.has(idx);
                        const days = Array.isArray(w.days) ? w.days : [];
                        const doneCount = days.filter((d) => d.checked).length;
                        const isCurrentWeek = w.weekIndex === activeWeekIndex;
                        
                        return (
                            <div key={w.weekIndex ?? idx} className="border border-gray-200 rounded-xl shadow-sm overflow-hidden bg-gray-50 hover:bg-white transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <button
                                        className={`w-full text-left p-3 flex items-center gap-3 transition-colors ${opened ? 'bg-white' : ''} hover:bg-gray-100/70`}
                                        onClick={() => {
                                            if (typeof setOpenWeeks === "function") {
                                                const next = new Set(weekSet);
                                                if (opened) next.delete(idx);
                                                else next.add(idx);
                                                setOpenWeeks(next);
                                            }
                                        }}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm flex-shrink-0 shadow-md transition-all duration-300 ${
                                            isCurrentWeek ? "bg-amber-500 text-white animate-pulse" : 
                                            opened ? "bg-purple-600 text-white" : 
                                            "bg-gray-200 text-gray-800"}`}>W{w.weekIndex + 1} 
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-base font-bold text-gray-800">Minggu {w.weekIndex + 1}</div>
                                            <div className="text-xs text-gray-500">{doneCount}/{days.length} hari selesai</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-xs font-semibold text-amber-500">{isCurrentWeek ? "AKTIF" : ""}</div>
                                            <div className={`p-1 rounded-full border bg-white transition-transform duration-300 ${opened ? 'rotate-180 border-gray-400' : 'border-gray-200'}`}>
                                                <ChevronDown className="w-4 h-4 text-gray-600" />
                                            </div>
                                        </div>
                                    </button>
                                </div>
                                {opened && (
                                    <div className="mt-2 ml-4 sm:ml-14 p-3 border-t border-gray-100 space-y-2 bg-white transition-all duration-500"> 
                                        {days.map((d) => (
                                            <DayItem
                                                key={d.dayIndex}
                                                dayData={d}
                                                currentDayIndex={currentDayIndex}
                                                photos={safePhotos}
                                                handleCheckin={handleCheckin}
                                                handlePhotoUpload={handlePhotoUpload}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>
        </section>
    );
}
