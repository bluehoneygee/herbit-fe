"use client"

import { Button } from '@/components/ui/button';
import { Check, Lock, Camera, ChevronRight, Zap } from "lucide-react";
import { CalendarCheck } from 'lucide-react'; // Asumsi CalendarCheck ada atau import dari lucide-react

function toLocalShort(d) {
    if (!d) return "-";
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function DayItem({ dayData, currentDayIndex, photos, handleCheckin, handlePhotoUpload }) {
    const { dayIndex, date, label, unlocked, checked } = dayData;
    const isGasDay = dayIndex % 7 === 0;
    const isPhotoDay = dayIndex === 30 || dayIndex === 60 || dayIndex === 90;
    const month = Math.min(3, Math.ceil(dayIndex / 30)); 
    const monthPhotoKey = `month${month}`;
    const photoPresent = !!photos[monthPhotoKey];
    const isToday = dayIndex === currentDayIndex;

    let baseClass = "bg-white p-4 rounded-xl shadow-md border border-gray-100 flex items-center justify-between transition-all duration-300 hover:shadow-lg";
    if (isToday && unlocked && !checked) {
        baseClass += " border-2 border-purple-400 shadow-xl ring-2 ring-purple-200 ring-offset-2 animate-pulse-once";
    }
    if (checked) {
        baseClass += " border-l-8 border-green-500 bg-green-50/50";
    }

    let LeftIcon = Lock;
    let iconClass = "w-6 h-6 text-gray-400";
    let iconBgClass = "bg-gray-100";

    if (checked) {
        if (isPhotoDay) {
            LeftIcon = Camera;
            iconBgClass = "bg-purple-600";
        } else if (isGasDay) {
            LeftIcon = Zap;
            iconBgClass = "bg-blue-500";
        } else {
            LeftIcon = Check;
            iconBgClass = "bg-green-500";
        }
        iconClass = "text-white w-6 h-6";
    } else if (unlocked) {
        LeftIcon = isToday ? CalendarCheck : ChevronRight;
        iconClass = isToday ? " text-purple-600 animate-bounce" : " text-amber-500";
        iconBgClass = isToday ? "bg-purple-100 border border-purple-300" : "bg-amber-50 border border-amber-300";
    }

    let StatusContent;

    if (isPhotoDay) {
        const photoLabel = photoPresent ? "Ganti Foto" : "Upload Foto";
        const isPhotoReady = unlocked;
        StatusContent = (
            <label className={`cursor-pointer text-sm px-3 py-2 rounded-lg font-medium flex items-center gap-1 flex-shrink-0 transition-colors duration-300 ${isPhotoReady ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>
                <Camera className="w-4 h-4" />
                <span>{photoLabel}</span>
                {isPhotoReady && (
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => { 
                            const file = e.target.files?.[0]; 
                            handlePhotoUpload(month, file);
                        }}
                    />
                )}
            </label>
        );
    } else if (checked) { 
        StatusContent = (
            <div className="flex items-center gap-2 text-green-600 flex-shrink-0 font-semibold">
                Selesai
                <Check className="w-5 h-5 animate-bounce-once"/>
            </div> 
        );
    } else if (unlocked) {
        StatusContent = (
            <Button 
                onClick={() => handleCheckin(dayIndex)} 
                className={`px-4 py-2 text-sm h-auto font-semibold flex-shrink-0 transition-all duration-300 shadow-md ${isToday ? "bg-purple-600 text-white hover:bg-purple-700 ring-2 ring-purple-300 ring-offset-1" : "bg-amber-500 text-white hover:bg-amber-600"} hover:scale-[1.03] active:scale-[0.98]`}
            >
                Check-in
            </Button> 
        );
    } else {
        StatusContent = (
            <div className="flex items-center text-xs text-gray-400 gap-1 flex-shrink-0">
                <Lock className="w-4 h-4" /> Terkunci
            </div>
        );
    }

    return (
        <div className={baseClass}>
            <div className="flex items-center gap-4">
                {/* Icon Circle */}
                <div className={`w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0 shadow ${iconBgClass}`}>
                    <LeftIcon className={iconClass} />
                </div>
                <div>
                    <div className="text-base font-bold text-gray-900">
                        {label}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                        {date ? toLocalShort(date) : "-"}
                    </div>
                </div>
            </div>
            {StatusContent}
        </div>
    );
}