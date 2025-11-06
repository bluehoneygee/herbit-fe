"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import apiClient from "@/lib/apiClient";
import HerbitBotAvatar from "./HerbitBotAvatar";

const initialGreeting = {
  id: "assistant-intro",
  role: "assistant",
  text: "Halo! Aku Herbit Assistant. Robot kecil ini siap bantu kamu tentang ecoenzym, gaya hidup sehat ramah lingkungan, atau fitur aplikasi Herbit.",
};

const systemPrompt = {
  role: "system",
  content:
    "Kamu adalah asisten Herbit. Fokus bantu pengguna dengan: Jawab singkat, 2-10 kalimat. Bahas cara memakai aplikasi Herbit (ecoenzym, daily task, reward, profil, poin), pertanyaan tentang program ecoenzym, gaya hidup sehat ramah lingkungan dan kebiasaan hijau, perempuan dan lingkungan. Untuk pertanyaan seputar aplikasi Herbit yang tidak bisa dijawab arahkan pengguna ke tiyaland3@gmail.com . Jika pertanyaan di luar ruang lingkup tersebut, tolak secara sopan dan arahkan kembali ke topik Herbit. Jawab ringkas, jelas, dan pakai Bahasa Indonesia santai. FAQ ringkas: 1) Daily Habits: centang aktivitas harian → poin masuk ke Progress Card. 2) Eco Enzym: unggah catatan & foto tiap 30/60/90 hari, fermentasi 90 hari sebelum klaim poin. 3) Rewards: poin dapat ditukar di tab Rewards, tombol 'Tukar' muncul kalau poin cukup. 4) Profil: ubah foto, username, email lewat menu Settings. 5) Login/akun: jika token kadaluarsa, sarankan logout lalu login ulang. 6) Support: masalah teknis bisa email ke tiyaland3@gmail.com. Selalu tarik jawaban dari informasi ini jika relevan.",
};

export default function HerbitAssistant({ userId: userIdProp = null }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([initialGreeting]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const hydratedRef = useRef(false);
  const [resolvedUserId, setResolvedUserId] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (userIdProp) {
      setResolvedUserId(userIdProp);
      try {
        sessionStorage.setItem("herbit-assistant-user", userIdProp);
      } catch (error) {
        console.warn("[HerbitAssistant] gagal menyimpan userId", error);
      }
      return;
    }

    try {
      const cached = sessionStorage.getItem("herbit-assistant-user");
      if (cached) {
        setResolvedUserId(cached);
        return;
      }
    } catch (error) {
      console.warn("[HerbitAssistant] gagal membaca userId", error);
    }

    let cancelled = false;
    apiClient
      .get("/auth/me", { headers: { "Cache-Control": "no-cache" } })
      .then((resp) => {
        if (cancelled) return;
        const payload = resp?.data ?? {};
        const data = payload?.data ?? payload ?? null;
        const id = data?._id || data?.id || data?.userId || null;
        if (id) {
          setResolvedUserId(id);
          try {
            sessionStorage.setItem("herbit-assistant-user", id);
          } catch (error) {
            console.warn("[HerbitAssistant] gagal menyimpan userId", error);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) {
          setResolvedUserId((prev) => prev ?? null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userIdProp]);

  const storageKey = useMemo(
    () => `herbit-assistant-history:${resolvedUserId ?? "guest"}`,
    [resolvedUserId]
  );

  const toggleOpen = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const sendMessage = useCallback(
    async (content) => {
      const trimmed = content.trim();
      if (!trimmed || loading) return;

      const userMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        text: trimmed,
      };

      const MAX_MESSAGES = 18;

      const pendingConversation = [...messages, userMessage].slice(-MAX_MESSAGES);
      setMessages(pendingConversation);
      setLoading(true);

      try {
        const body = {
          messages: [
            systemPrompt,
            ...pendingConversation.map((item) => ({
              role: item.role,
              content: item.text,
            })),
          ],
        };

        const response = await apiClient.post("/ai/chat", body);

        const data = response?.data ?? {};
        const textCandidate =
          (typeof data?.reply === "string" && data.reply) ||
          (typeof data?.answer === "string" && data.answer) ||
          (typeof data?.message?.content === "string" &&
            data.message.content) ||
          (typeof data?.data?.message?.content === "string" &&
            data.data.message.content) ||
          (typeof data?.message === "string" && data.message) ||
          (typeof data?.data?.message === "string" && data.data.message);

        const text = textCandidate?.trim()
          ? textCandidate
          : "Maaf, aku belum bisa menjawab pertanyaan itu.";

        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            text,
          },
        ]);
      } catch (error) {
        const errPayload = error?.response?.data ?? {};
        const limitMessage =
          errPayload?.code === "AI_DAILY_LIMIT_REACHED"
            ? "Batas pertanyaan harian tercapai. Coba lagi besok, ya."
            : null;
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-error-${Date.now()}`,
            role: "assistant",
            text:
              limitMessage ||
              errPayload?.error ||
              errPayload?.message ||
              (error instanceof Error && error.message
                ? `Maaf, terjadi kesalahan: ${error.message}`
                : "Maaf, asisten sedang tidak bisa merespons. Coba lagi sebentar lagi."),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadFromStorage = (key) => {
      try {
        const raw = sessionStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) && parsed.length ? parsed : null;
      } catch (error) {
        console.warn("[HerbitAssistant] gagal memuat riwayat chat", error);
        return null;
      }
    };

    hydratedRef.current = false;

    const current = loadFromStorage(storageKey);
    if (current) {
      setMessages(current);
      hydratedRef.current = true;
      return;
    }

    const guestKey = "herbit-assistant-history:guest";
    if (storageKey !== guestKey) {
      const guestHistory = loadFromStorage(guestKey);
      if (guestHistory) {
        setMessages(guestHistory);
        try {
          sessionStorage.setItem(storageKey, JSON.stringify(guestHistory));
          sessionStorage.removeItem(guestKey);
        } catch (error) {
          console.warn(
            "[HerbitAssistant] gagal memigrasikan riwayat chat",
            error
          );
        }
        hydratedRef.current = true;
        return;
      }
    }

    setMessages([initialGreeting]);
    hydratedRef.current = true;
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hydratedRef.current) return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (error) {
      console.warn("[HerbitAssistant] gagal menyimpan riwayat chat", error);
    }
  }, [messages, storageKey]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const value = input;
      setInput("");
      sendMessage(value);
    },
    [input, sendMessage]
  );

  useEffect(() => {
    if (!open) return;
    const node = bottomRef.current;
    if (node) {
      node.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const floatingButton = useMemo(
    () => (
      <button
        type="button"
        onClick={toggleOpen}
        className="fixed bottom-28 right-6 z-40 transition duration-200 hover:scale-110 sm:bottom-20"
        aria-expanded={open}
        aria-controls="herbit-assistant-panel"
      >
        <HerbitBotAvatar className="h-20 w-20 drop-shadow-[0_18px_34px_rgba(15,23,42,0.22)] animate-[wiggle_3s_ease-in-out_infinite]" />
        <span className="sr-only">Buka Herbit Assistant</span>
      </button>
    ),
    [open, toggleOpen]
  );

  return (
    <>
      {floatingButton}

      {open && (
        <div
          id="herbit-assistant-panel"
          className="fixed bottom-40 right-4 z-40 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 sm:bottom-28"
        >
          <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 text-[#0A0A19]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <HerbitBotAvatar className="h-8 w-8" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold">Herbit Assistant</p>
                <p className="text-[11px] text-gray-500">
                  Robot Herbit siap bantu kamu
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleOpen}
              aria-label="Tutup asisten"
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto bg-white px-4 py-4 text-sm text-gray-800">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex w-full ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="mr-2 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                    <HerbitBotAvatar className="h-8 w-8" mood="wave" />
                  </div>
                )}
                <div
                  className={
                    message.role === "user"
                      ? "max-w-[75%] rounded-2xl bg-[#f3f4f6] px-3 py-2 text-right shadow-sm"
                      : "max-w-[80%] rounded-2xl border border-gray-100 bg-white px-3 py-2 shadow-sm"
                  }
                >
                  {message.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 self-start rounded-2xl border border-gray-100 bg-white px-3 py-2 text-xs text-gray-500 shadow-sm">
                <HerbitBotAvatar className="h-7 w-7" />
                <span>Herbit sedang berpikir…</span>
              </div>
            )}
            <span ref={bottomRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-gray-100 bg-white px-4 py-3"
          >
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Tulis pertanyaanmu…"
              className="flex-1 rounded-full border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0f172a] text-white shadow-md transition hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-200"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
      <style jsx global>{`
        @keyframes wiggle {
          0%,
          100% {
            transform: rotate(0deg);
          }
          20% {
            transform: rotate(4deg);
          }
          50% {
            transform: rotate(0deg);
          }
          80% {
            transform: rotate(-4deg);
          }
        }
      `}</style>
    </>
  );
}
