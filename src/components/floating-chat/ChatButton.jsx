"use client";

import { useState, useRef, useEffect } from "react";
import {Accordion,AccordionItem,AccordionTrigger,AccordionContent,} from "@/components/ui/accordion";
import { X, Search, CheckSquare, Droplet, Grid, ChevronLeft, Send } from "lucide-react"; 
import { ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils"; 
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const faqData = {
    "Habit Tracker": [
       {
      "question": "Apa itu Habit Tracker?",
      "answer": "Alat atau aplikasi untuk membantu memonitor dan membangun kebiasaan sehari-hari."
    },
    {
      "question": "Bagaimana cara menggunakannya setiap hari?",
      "answer": "Catat aktivitas harian dan tandai setiap kali berhasil menjalankan kebiasaan."
    },
    {
      "question": "Tips agar konsisten pakai Habit Tracker?",
      "answer": "Mulai dengan kebiasaan kecil, gunakan pengingat, dan *review* progres setiap minggu."
    },
    {
      "question": "Mengapa Habit Tracker penting?",
      "answer": "Membantu visualisasi kemajuan, meningkatkan kesadaran diri terhadap kebiasaan, dan menciptakan akuntabilitas (pertanggungjawaban)."
    },
    {
      "question": "Apakah harus menggunakan aplikasi digital?",
      "answer": "Tidak. Anda bisa menggunakan buku catatan, kalender, *spreadsheet*, atau aplikasi. Pilih yang paling nyaman bagi Anda."
    },
    {
      "question": "Berapa lama waktu ideal untuk melihat hasil dari Habit Tracker?",
      "answer": "Kebiasaan baru umumnya membutuhkan waktu 21 hingga 66 hari untuk menjadi otomatis. Konsistensi pelacakan selama minimal 2-3 bulan sangat disarankan."
    },
    {
      "question": "Apa yang dimaksud 'rantai tidak terputus' dalam Habit Tracker?",
      "answer": "Ini adalah metafora visual, di mana setiap hari Anda berhasil melakukan kebiasaan, Anda membuat 'mata rantai'. Tujuannya adalah tidak membiarkan rantai itu terputus (tidak melewatkan satu hari pun)."
    },
    {
      "question": "Apa yang harus dilakukan jika saya melewatkan satu hari (rantai terputus)?",
      "answer": "Jangan menyerah! Prinsipnya adalah 'Jangan pernah melewatkan dua kali berturut-turut' (*never miss twice*). Lanjutkan kebiasaan Anda segera pada hari berikutnya."
    },
    {
      "question": "Kebiasaan apa saja yang cocok dilacak?",
      "answer": "Kebiasaan spesifik yang bisa diukur, seperti minum 8 gelas air, membaca 10 halaman buku, berolahraga 30 menit, atau meditasi 5 menit."
    },
    {
      "question": "Apa manfaat psikologis dari melacak kebiasaan?",
      "answer": "Memberikan rasa pencapaian (kepuasan) saat melihat progres, yang memicu dopamin, membantu memperkuat motivasi untuk terus melanjutkan kebiasaan tersebut."
    },
    {
      "question": "Bagaimana cara menentukan kebiasaan baru yang efektif?",
      "answer": "Gunakan metode 'Atomic Habits': Tentukan pemicu (*cue*), keinginan (*craving*), respons (*response*), dan imbalan (*reward*). Buat kebiasaan itu Jelas, Menarik, Mudah, dan Memuaskan."
    },
    {
      "question": "Kapan waktu terbaik untuk mengisi Habit Tracker?",
      "answer": "Segera setelah Anda menyelesaikan kebiasaan tersebut, atau di waktu tertentu setiap hari (misalnya, saat sarapan atau sebelum tidur) sebagai bagian dari rutinitas harian Anda."
    },
    {
      "question": "Apa perbedaan antara 'Habit' dan 'Goal' (Tujuan) dalam konteks pelacakan?",
      "answer": "Goal adalah hasil yang ingin dicapai (misal: Menurunkan berat badan 5 kg), sedangkan Habit adalah proses yang dilakukan secara rutin untuk mencapai goal tersebut (misal: Berlari 3 kali seminggu)."
    },
    {
      "question": "Apa itu 'Habit Stacking'?",
      "answer": "Strategi di mana kebiasaan baru ditambahkan/disambungkan setelah kebiasaan yang sudah ada. Formula: 'Setelah [Kebiasaan saat ini], saya akan [Kebiasaan baru]'."
    },
    {
      "question": "Berapa banyak kebiasaan yang idealnya dilacak dalam satu waktu?",
      "answer": "Disarankan untuk fokus pada 1 hingga 3 kebiasaan baru yang utama terlebih dahulu. Terlalu banyak kebiasaan bisa menyebabkan *burnout* dan kegagalan."
    },
    {
      "question": "Bagaimana cara membuat kebiasaan terasa 'menarik' agar mudah dilacak?",
      "answer": "Gunakan teknik *Temptation Bundling*, yaitu menggabungkan kebiasaan yang 'perlu' dilakukan (dilacak) dengan sesuatu yang 'ingin' Anda lakukan (misal: Mendengarkan *podcast* favorit hanya saat sedang mencuci piring)."
    },
    {
      "question": "Bagaimana cara melacak kebiasaan 'buruk' yang ingin dihilangkan?",
      "answer": "Alih-alih melacak 'melakukan' kebiasaan buruk, lacak kebiasaan pengganti yang positif. Atau, lacak 'frekuensi' kebiasaan buruk, dengan target mengurangi angka tersebut setiap minggu."
    },
    {
      "question": "Apakah Habit Tracker efektif untuk kebiasaan yang hanya dilakukan mingguan (bukan harian)?",
      "answer": "Ya, Habit Tracker dapat disesuaikan. Tandai kolom pelacakan dengan target mingguan (misalnya, 3x seminggu), bukan harus harian."
    },
    {
      "question": "Apa yang harus saya lakukan dengan data lama yang sudah dilacak?",
      "answer": "Gunakan untuk analisis. Identifikasi pola di mana Anda sering gagal (*trigger* kegagalan) dan kapan Anda paling sukses, lalu sesuaikan lingkungan dan strategi Anda."
    },
    {
      "question": "Mengapa visualisasi kemajuan itu penting?",
      "answer": "Melihat garis panjang keberhasilan (rantai yang utuh) bertindak sebagai penguat visual yang kuat. Ini mengubah kebiasaan abstrak menjadi bukti nyata bahwa Anda membuat kemajuan."
    },
    {
      "question": "Apa yang dimaksud dengan 'Environmental Design' dalam membangun kebiasaan?",
      "answer": "Mengatur lingkungan fisik Anda agar kebiasaan baik menjadi lebih mudah dan kebiasaan buruk menjadi sulit. Misalnya, meletakkan buku di bantal agar mudah dibaca (kebiasaan baik) dan menyembunyikan *remote* TV (kebiasaan buruk)."
    },
    {
      "question": "Bagaimana cara menggunakan Habit Tracker untuk membangun identitas diri?",
      "answer": "Fokus pada 'menjadi' orang yang Anda inginkan (misal: 'Saya adalah seorang pembaca'). Setiap kali Anda mencentang, Anda memberikan 'suara' pada identitas tersebut, yang pada akhirnya akan memperkuat kebiasaan Anda."
    },
    ],
    "Eco Enzyme": [
        {
            question: "Apa itu Eco Enzyme?",
            answer: "Eco Enzyme adalah cairan fermentasi dari limbah organik seperti buah dan sayur yang bisa digunakan sebagai pembersih alami dan pupuk.",
        },
        {
            question: "Bagaimana cara membuat Eco Enzyme?",
            answer: "Campurkan limbah organik, gula, dan air, lalu fermentasi selama 3 bulan dalam wadah tertutup.",
        },
        {
            question: "Manfaat Eco Enzyme untuk lingkungan?",
            answer: "Mengurangi limbah, sebagai pembersih alami, dan meningkatkan kesuburan tanah.",
        },

        {
            question: "Apa tujuan utama pembuatan eco enzyme ?",
            answer: "Untuk menyelamatkan bumi dari polusi kimiawi, gas metana dan pemanasan global yg berakibat fatal bagi kehidupan manusia dan makhluk hidup lainnya.",
        },
        {
            question: "Kenapa harus gula merah tebu ?",
            answer: " Menurut hasil penelitian selama 30 thn dari Dr. Rosukon, gula merah tebu asli akan menghasilkan eco enzyme yang berkualitas tinggi dan terjamin.",
        },
        {
            question: "Daerah saya susah dapat gula merah tebu, apakah ada penggantinya ?",
            answer: "Ada, yakni gula jawa, gula aren, gula palem dan molase cair.",
        },
        {
            question: "Apakah wadah yg tidak ada tutupnya masih bisa dipakai ?",
            answer: "Bisa, dengan cara pakai plastik dan diikat dengan rapat.",
        },
        {
            question: "Apakah boleh pakai satu macam bahan organik saja ?",
            answer: " Boleh, tapi lebih baik lagi bila bahan organiknya bervariasi.",
        },
{
    "question": "Berapa macam bahan organik yang ditentukan untuk pembuatan eco enzyme?",
    "answer": "Tidak ada pembatasan, semakin banyak macam bahan organik-nya, semakin bagus *eco enzyme-nya."
  },
  {
    "question": "Apakah daging buah boleh dijadikan bahan organik?",
    "answer": "Boleh. Asalkan belum busuk."
  },
  {
    "question": "Apakah dalam proses pembuatan eco enzyme harus diaduk setiap saat?",
    "answer": "Tidak harus, pengadukan cuma dilakukan sesekali saja bila ada waktu supaya bahan tercampur rata."
  },
  {
    "question": "Apakah air yang digunakan untuk membuat eco enzyme boleh dimasak terlebih dahulu?",
    "answer": "Tidak boleh. Air yang terbaik adalah air sumur yang tidak dimasak. Apabila mau menggunakan air PAM, sebaiknya di-diamkan minimal 24 jam agar kaporitnya mengendap ke bawah dan baru ambil air bagian atas."
  },
  {
    "question": "Bagaimana mengatasi kemunculan ulat / belatung sebelum panen?",
    "answer": "Tambahkan gula merah tebu lagi sesuai porsi awal, tutup dengan rapat dan lanjutkan fermentasi lagi sampai panen."
  },
  {
    "question": "Apakah eco enzyme memiliki efek samping?",
    "answer": "Tidak ada. Karena eco enzyme semuanya terbuat dari bahan alami. Cuma yang harus diperhatikan adalah takaran pencampuran dengan air harus benar."
  },
  {
    "question": "Apakah eco enzyme bisa menyuburkan tanah gersang?",
    "answer": "Bisa sekali. Karena eco enzyme mengandung probiotik yaitu jamur dan bakteri yang baik."
  },
  {
    "question": "Apakah bahan organiknya perlu diblender?",
    "answer": "Tidak perlu, cukup dipotong kecil untuk memaksimalkan hasil fermentasi."
  },
  {
    "question": "Apakah bahan organik itu harus organik?",
    "answer": "Tidak harus, bahan organik dalam pembuatan *eco enzyme* adalah segala macam kulit buah dan sayur yang belum pernah dimasak."
  },
  {
    "question": "Apakah buah dan sayur yang sudah busuk boleh dijadikan bahan organik eco enzyme?",
    "answer": "Tidak boleh, karena bahan yang sudah busuk mengandung bakteri jahat yang dapat menghambat proses fermentasi eco enzyme."
  },
  {
    "question": "Apa itu gas O3?",
    "answer": "Gas O3 adalah gas Ozon, gas yang dikeluarkan saat proses fermentasi. Gas ini mampu membunuh bakteri jahat, mengurangi polusi udara, dan meningkatkan kualitas oksigen."
  },
  {
    "question": "Bila eco enzyme belum genap 3 bulan tapi jamur pitera sudah muncul, apakah sudah boleh panen?",
    "answer": "Tidak boleh, karena proses fermentasi harus minimal 3 bulan."
  },
  {
    "question": "Eco enzyme yang sudah disaring ke botol muncul ulat / magot, apakah sudah rusak atau masih bisa dipakai?",
    "answer": "Masih bisa, bila aromanya masih harum, saring sekali lagi untuk buang ulatnya lalu tutup dengan rapat."
  },
  {
    "question": "Eco enzyme saya sudah genap 3 bulan tapi tidak nampak jamur putih/pitera di lapisan atas, apakah eco enzyme saya gagal?",
    "answer": "Tidak, jamur putih / pitera yang muncul di atas permukaan eco enzyme tidak menentukan gagal / sukses-nya eco enzyme."
  },
  {
    "question": "Apakah eco enzyme ada kadaluwarsanya?",
    "answer": "Tidak, eco enzyme tidak ada kadaluwarsa. Semakin lama disimpan, semakin baik fungsi gunanya."
  },
  {
    "question": "Berapa ukuran pH eco enzyme yang baik?",
    "answer": "Setelah 3 bulan, eco enzyme yang baik memiliki pH di bawah 4.0."
  },
  {
    "question": "Saya tidak sabar menunggu selama 3 bulan, apakah boleh eco enzyme saya tambah ragi atau EM4 untuk mempercepat proses fermentasi?",
    "answer": "Tidak boleh. Proses pembuatan eco enzyme yang benar harus sesuai dengan formula dari Dr. Rosukon Poompanvong."
  },
  {
    "question": "Apakah ampas jus boleh dijadikan bahan eco enzyme?",
    "answer": "Sebaiknya jangan, karena sarinya sudah hilang tinggal seratnya saja, lebih cocok dijadikan kompos."
  },
    ],
    General: [
       {
      "question": "Apa fitur utama aplikasi ini?",
      "answer": "Chat AI, FAQ kategori, habit tracker, dan monitoring Eco Enzyme."
    },
    {
      "question": "Bagaimana cara menghubungi support?",
      "answer": "Kirim email ke support@domain.com atau gunakan chat AI untuk pertanyaan umum."
    },
    {
      "question": "Apakah data saya aman?",
      "answer": "Semua data disimpan secara aman dan tidak dibagikan ke pihak ketiga."
    },
    {
      "question": "Di platform mana saja aplikasi ini tersedia?",
      "answer": "Aplikasi ini tersedia untuk perangkat Android dan iOS (masukkan platform yang sesuai)."
    },
    {
      "question": "Apakah aplikasi ini gratis?",
      "answer": "Ya, aplikasi ini gratis dengan opsi berlangganan premium untuk fitur tambahan (sesuaikan dengan model bisnis Anda)."
    },
    {
      "question": "Apa saja manfaat dari berlangganan premium?",
      "answer": "Fitur premium meliputi analitik Habit Tracker yang lebih mendalam, penyimpanan riwayat Eco Enzyme tak terbatas, dan dukungan prioritas."
    },
    {
      "question": "Bagaimana cara saya melakukan reset password?",
      "answer": "Buka halaman login, klik 'Lupa Kata Sandi', dan ikuti instruksi yang dikirimkan ke email Anda."
    },
    {
      "question": "Apakah saya perlu koneksi internet untuk menggunakan semua fitur?",
      "answer": "Fitur Chat AI dan sinkronisasi data membutuhkan koneksi internet, tetapi fitur dasar Habit Tracker dan FAQ dapat diakses secara offline."
    },
    {
      "question": "Apakah aplikasi ini mendukung mode gelap (Dark Mode)?",
      "answer": "Ya, aplikasi ini sepenuhnya mendukung mode gelap untuk kenyamanan mata Anda."
    },
    {
      "question": "Bagaimana cara memberikan masukan atau saran untuk pengembangan aplikasi?",
      "answer": "Anda bisa menggunakan formulir 'Kirim Masukan' di menu Pengaturan, atau mengirimkannya langsung ke support@domain.com."
    },
    {
      "question": "Apakah ada batasan jumlah habit yang bisa dilacak?",
      "answer": "Untuk pengguna gratis, batasan maksimal 5 habit. Pengguna premium dapat melacak habit tanpa batas."
    },
    {
      "question": "Bagaimana cara kerja fitur monitoring Eco Enzyme?",
      "answer": "Fitur ini memungkinkan pengguna mencatat tanggal mulai, rasio bahan, dan memberikan pengingat untuk membuka tutup botol serta tanggal panen."
    },
    {
      "question": "Bolehkah saya menggunakan satu akun di beberapa perangkat?",
      "answer": "Ya, Anda dapat masuk ke akun Anda di berbagai perangkat, dan data akan disinkronkan secara otomatis."
    },
    {
      "question": "Bagaimana cara menghapus akun saya?",
      "answer": "Anda bisa meminta penghapusan akun permanen melalui email support@domain.com, atau melalui opsi yang tersedia di menu Pengaturan Akun."
    },
    {
      "question": "Apakah ada panduan penggunaan (tutorial) aplikasi ini?",
      "answer": "Ya, panduan singkat dan video tutorial tersedia di bagian FAQ kategori dan di situs web resmi kami."
    },
    {
      "question": "Bagaimana aplikasi ini menangani perbedaan zona waktu?",
      "answer": "Aplikasi akan secara otomatis menyesuaikan dengan zona waktu perangkat Anda, memastikan pelacakan habit dan pengingat yang akurat."
    },
    {
      "question": "Apakah ada iklan di aplikasi ini?",
      "answer": "Versi gratis mungkin menampilkan iklan non-invasif. Versi premium sepenuhnya bebas iklan."
    },
    {
      "question": "Seberapa sering aplikasi ini mendapatkan pembaruan (update)?",
      "answer": "Kami secara rutin merilis pembaruan, biasanya setiap 2-4 minggu, untuk perbaikan bug, peningkatan performa, dan penambahan fitur baru."
    },
    {
      "question": "Saya lupa email yang terdaftar. Apa yang harus saya lakukan?",
      "answer": "Segera hubungi tim support melalui email support@domain.com dengan menyertakan informasi identifikasi lain yang mungkin Anda miliki."
    },
    {
      "question": "Apakah saya bisa membagikan progres Habit Tracker saya ke media sosial?",
      "answer": "Ya, aplikasi menyediakan fitur berbagi yang memungkinkan Anda mempublikasikan pencapaian dan *streak* Anda ke berbagai platform media sosial."
    },
    ],
};

const getFaqIcon = (category) => {
    switch (category) {
        case 'Habit Tracker': return <CheckSquare className="w-5 h-5 text-yellow-600 mr-2" />;
        case 'Eco Enzyme': return <Droplet className="w-5 h-5 text-yellow-600 mr-2" />;
        case 'General': return <Grid className="w-5 h-5 text-yellow-600 mr-2" />;
        default: return null;
    }
}

function ChatView({ setView, handleClose }) {
  const [messages, setMessages] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("chatMessages");
      return saved ? JSON.parse(saved) : [
        { id: 1, text: "Halo, saya ada pertanyaan tentang Eco Enzyme!", sender: "user" },
        { id: 2, text: "Tentu! Senang membantu. Silakan sampaikan pertanyaan Anda.", sender: "ai" },
      ];
    }
    return [];
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // 🧠 Simpan pesan setiap kali messages berubah
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { id: Date.now(), text: userMessage, sender: "user" }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage }),
      });

      if (!response.ok) throw new Error("Gagal mendapatkan respons dari AI.");

      const data = await response.json();
      let aiText = "";
      if (typeof data.reply === "string") aiText = data.reply;
      else if (Array.isArray(data.reply)) aiText = data.reply.join("\n");
      else if (data.reply && typeof data.reply === "object") aiText = JSON.stringify(data.reply, null, 2);
      else aiText = String(data.reply || "");

      setMessages((prev) => [...prev, { id: Date.now() + 1, text: aiText, sender: "ai" }]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: "Maaf, terjadi masalah koneksi atau server AI.", sender: "ai" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex items-center p-3 border-b bg-amber-400">
                <button onClick={() => setView('main')} className="text-gray-900 hover:text-gray-800 p-1 mr-2">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <p className="font-semibold text-gray-900">Chat AI</p>
                    <p className="text-xs text-gray-700">Hello, Ada yang bisa kami bantu?</p>
                </div>
                <button onClick={handleClose} className="p-1 text-gray-900 hover:text-gray-700">
                    <X className="w-5 h-5" />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
                {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex", { "justify-end": msg.sender === 'user', "justify-start": msg.sender === 'ai' })}>
                        <div className={cn("p-3 rounded-xl max-w-[80%] text-sm", {
        "bg-purple-600 text-white rounded-br-none": msg.sender === 'user',
       "bg-gray-100 text-gray-800 rounded-tl-none max-w-none": msg.sender === 'ai',

    })}>
                            {msg.sender === 'ai' ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
  {typeof msg.text === "string" ? msg.text : JSON.stringify(msg.text)}
</ReactMarkdown>

        ) : (
            msg.text 
        )}
                        </div>
                    </div>
                ))}
               {isLoading && (
    <div className="flex justify-start">
        <div className="bg-gray-100 text-gray-500 p-3 rounded-xl rounded-tl-none max-w-[80%] text-sm italic relative pr-8">
            AI sedang mengetik
            <span 
                className="absolute right-3 bottom-3 text-lg font-bold" >
                ...
            </span>
        </div>
    </div>
)}
<div ref={chatEndRef} />
</div>
            <div className="p-3 border-t bg-white flex items-center">
                <input
                    type="text"
                    placeholder="Ketik pesan..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    disabled={isLoading}
                    className="flex-1 border border-gray-300 p-2.5 rounded-full mr-2 text-sm focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-50"/>
                <button 
                    onClick={handleSend} 
                    disabled={!input.trim() || isLoading}
                    className="bg-purple-600 text-white p-2.5 rounded-full hover:bg-purple-700 disabled:bg-gray-400 transition" >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
function FaqDetailView({ setView, category, handleClose }) {
    const items = faqData[category] || [];
    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex items-center p-3 border-b bg-amber-400">
                <button onClick={() => setView('main')} className="text-gray-900 hover:text-gray-800 p-1 mr-2">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 flex items-center">
                    {getFaqIcon(category)}
                    <p className="font-bold text-gray-900">{category}</p>
                </div>
                <button onClick={handleClose} className="p-1 text-gray-900 hover:text-gray-700">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
                <Accordion type="single" collapsible className="w-full">
                    {items.map(({ question, answer }) => (
                        <AccordionItem key={question} value={question} className="border-b">
                            <AccordionTrigger className="text-sm font-semibold text-gray-700 hover:no-underline hover:text-purple-600 transition">
                                {question}
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-gray-700 text-sm py-2">{answer}</p>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
}
function MainView({ setView, setSelectedCategory, handleClose }) {
    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex justify-between items-start p-4 bg-amber-400 ">
                <div>
                    <h2 className="text-xl font-extrabold text-gray-900">Helooow!</h2>
                    <p className="text-sm text-gray-700">Temukan jawaban Anda di sini.</p>
                </div>
                <button 
                    onClick={handleClose}
                    className="p-1 rounded-full text-gray-900 hover:bg-amber-500 transition"
                    aria-label="Tutup">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <div className="overflow-y-auto px-4 py-4 space-y-6 flex-1">
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 shadow-sm">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">Sampaikan pertanyaan Anda!</h3>
                    <button 
                        onClick={() => setView('chat')} 
                        className="w-full text-left flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 transition duration-150 shadow-inner hover:shadow-lg">
                        <div className="w-8 h-8 flex items-center justify-center text-purple-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bot"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                        </div>
                        <div> 
                            <p className="font-semibold text-gray-900">Chat AI</p>
                            <p className="text-xs text-gray-600">Dapatkan jawaban instan dari AI kami.</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                    </button>
                </div>
                {/* FAQ Kategori */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 shadow-sm">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                        <h3 className="font-bold text-lg text-gray-900">FAQ Berdasarkan Kategori</h3>
                        <Search className="w-5 h-5 text-gray-400" />
                    </div>             
                    <div className="space-y-3">
                        {Object.keys(faqData).map((category) => (
                            <button
                                key={category}
                                onClick={() => {
                                    setSelectedCategory(category);
                                    setView('faq_detail');
                                }}
                                className="w-full text-left flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:translate-x-1 hover:border-purple-300 transition duration-150"
                            >
                                <div className="flex items-center font-semibold text-gray-800">
                                    {getFaqIcon(category)}
                                    {category}
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
// --- MAIN COMPONENT: ChatbotButton ---
export default function ChatButton() {
    // view state: 'main' | 'chat' | 'faq_detail'
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('main'); 
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isClosing, setIsClosing] = useState(false);

    const handleOpen = () => {
        setIsOpen(true);
        setIsClosing(false);
    };
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsOpen(false);
            setView('main'); 
            setIsClosing(false);
        }, 300); 
    };

    const renderView = () => {
        switch (view) {
            case 'chat':
                return <ChatView setView={setView} handleClose={handleClose} />;
            case 'faq_detail':
                return <FaqDetailView setView={setView} category={selectedCategory} handleClose={handleClose} />;
            case 'main':
            default:
                return <MainView setView={setView} setSelectedCategory={setSelectedCategory} handleClose={handleClose} />;
        }
    }

    const modalClasses = cn(
        "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
       "w-[90vw] max-w-lg lg:max-w-3xl h-[90vh] max-h-[700px] bg-white border rounded-2xl shadow-2xl",
        "flex flex-col z-[9999] overflow-hidden transition-all duration-300 ease-in-out",
        {
            "opacity-100 scale-100": isOpen && !isClosing, 
            "opacity-0 scale-90 pointer-events-none": !isOpen || isClosing, 
        }
    );

    return (
        <>
            <button
                className="justify-center items-center flex fixed bottom-35 right-15 bg-purple-600 text-white p-6 rounded-full shadow-2xl z-[9999] hover:bg-purple-700 hover:scale-110 transition-all duration-300 ease-in-out"
                onClick={() => (isOpen ? handleClose() : handleOpen())}
                aria-label={isOpen ? "Tutup Chat" : "Buka Chat"}
            >
                {isOpen ? <X className="w-6 h-6" /> : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bot"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                )}
                <span className="ml-1">Chat AI</span>
            </button>
            {isOpen && (
                <>
                   <div 
                        className={cn(
                            "fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998] transition-opacity duration-300",
                            {
                                "opacity-100": !isClosing,
                                "opacity-0": isClosing,
                            }
                        )}
                        onClick={handleClose}
                    />
                    <div className={modalClasses}>
                        {renderView()}
                    </div>
                </>
            )}
        </>
    );
}