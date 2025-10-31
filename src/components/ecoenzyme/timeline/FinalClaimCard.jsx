"use client"

import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';

export default function FinalClaimCard({ isReadyForClaim, isFinalClaimed, allCheckinsDone, allPhotosUploaded, TOTAL_POINTS, handleFinalClaim }) {
    return (
        <div className="border-4 border-dashed border-amber-400 p-6 bg-white rounded-2xl shadow-2xl max-w-lg mx-auto mb-8 transition-all duration-500 hover:shadow-3xl">
            <h3 className="font-extrabold text-2xl text-center text-amber-500 mb-4 flex items-center justify-center gap-2">
                <Trophy className="w-7 h-7 fill-amber-500 text-amber-500 animate-spin-slow" /> Klaim Bonus Akhir {TOTAL_POINTS} Pts
            </h3>
            {isFinalClaimed ? (
                <div className="text-center p-6 bg-green-50 border-2 border-green-500 rounded-xl animate-bounce-once">
                    <p className="font-extrabold text-green-700 text-2xl">SUKSES DIKLAIM! 🎉</p>
                    <p className="text-sm text-green-600 mt-2">Terima kasih telah menyelesaikan seluruh challenge 90 hari.</p>
                </div>
            ) : (
                <div className="text-center">
                    <p className="text-gray-700 mb-4 font-medium">
                        Selesaikan semua syarat di bawah ini untuk mengaktifkan tombol klaim:
                    </p>
                    <ul className="text-left mb-6 text-sm mx-auto w-fit space-y-3">
                        <li className={`flex items-center gap-2 transition-colors duration-300 ${allCheckinsDone ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                            {allCheckinsDone ? '✅' : '🔴'} Check-in 90 hari
                        </li>
                        <li className={`flex items-center gap-2 transition-colors duration-300 ${allPhotosUploaded ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                            {allPhotosUploaded ? '✅' : '🔴'} 3 Foto Bulanan (di hari 30, 60, & 90) di-upload
                        </li>
                    </ul>
                    <Button 
                        onClick={handleFinalClaim}
                        disabled={!isReadyForClaim}
                        className={`w-full py-3 text-lg font-bold transition-all duration-300 shadow-lg ${isReadyForClaim ? 'bg-purple-600 hover:bg-purple-700 hover:scale-[1.02] active:scale-[0.98]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'} ${isReadyForClaim ? 'animate-pulse' : ''}`} 
                    >
                        {isReadyForClaim ? `Klaim Semua ${TOTAL_POINTS} Pts Sekarang!` : `Syarat Belum Terpenuhi`}
                    </Button>
                </div>
            )}
        </div>
    );
}