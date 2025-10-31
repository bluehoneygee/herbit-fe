// utils/timelineUtils.js (atau letakkan di bagian atas TimelinePage.js)

/**
 * Menghitung selisih hari dari startDate ke endDate (termasuk hari itu).
 * @param {Date} start - Tanggal mulai proyek
 * @param {Date} end - Tanggal yang disimulasikan sebagai 'Hari Ini'
 * @returns {number} Jumlah hari yang telah berlalu (currentDayIndex)
 */
function getDaysPassed(start, end) {
    const startOfDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endOfDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    
    // Hitung selisih dalam milidetik
    const diffTime = Math.abs(endOfDay - startOfDay);
    // Konversi ke hari (ditambah 1 karena hari mulai dihitung)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; 
    
    return diffDays;
}

/**
 * Menghasilkan data check-in dan foto dummy berdasarkan total hari yang disimulasikan.
 * @param {number} totalDays - Total hari yang disimulasikan (90 untuk klaim, 10 untuk testing)
 * @returns {{checkedInDays: object, photos: object}} State dummy
 */
function generateDummyState(totalDays) {
    const checkedInDays = {};
    const photos = {};
    
    // 1. Check-in: Semua hari hingga (totalDays) dianggap sudah check-in
    for (let i = 1; i <= totalDays; i++) {
        checkedInDays[i] = true;
    }

    // 2. Photos: Semua foto mingguan (setiap 7 hari) hingga totalDays
    const totalWeeks = Math.floor(totalDays / 7);
    for (let w = 1; w <= totalWeeks; w++) {
        const dayIndex = w * 7;
        photos[dayIndex] = { 
            url: `/dummy/photo-week-${w}.jpg`,
            uploadedAt: new Date().toISOString()
        };
    }
    
    return { checkedInDays, photos };
}