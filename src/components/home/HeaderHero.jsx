"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import CalendarOverlay from "./CalendarOverlay";
import apiClient from "@/lib/apiClient";

function CalendarIcon({ size = 20 }) {
  return (
    <img
      src="/icons/calendar.svg"
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
    />
  );
}

function BellIcon({ size = 20, color = "#111827", showIndicator = false }) {
  return (
    <div className="relative inline-flex">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M19 16.5H5.00003C5.00003 16.5 6.5 14.5 6.5 10.5C6.5 6.91015 9.41016 4 13 4C16.5899 4 19.5 6.91015 19.5 10.5C19.5 14.5 21 16.5 21 16.5H19Z"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.5 18C10.8029 18.8825 11.7008 19.5 12.75 19.5C13.7992 19.5 14.6971 18.8825 15 18"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showIndicator && (
        <span className="absolute -right-1.5 -top-1 h-3 w-3 rounded-full bg-[#E24B4B] ring-2 ring-white" />
      )}
    </div>
  );
}

export default function HeaderHero({ user, loading = false }) {
  const router = useRouter();
  const [showCalendar, setShowCalendar] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);
  const calendarButtonRef = useRef(null);
  const calendarPanelRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    if (!showCalendar) {
      return undefined;
    }

    function handlePointerDown(event) {
      const panel = calendarPanelRef.current;
      const button = calendarButtonRef.current;
      if (!panel || !button) {
        return;
      }

      if (!panel.contains(event.target) && !button.contains(event.target)) {
        setShowCalendar(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setShowCalendar(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    const panel = calendarPanelRef.current;
    if (panel) {
      panel.focus();
    }

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showCalendar]);

  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (!showCalendar && wasOpenRef.current && calendarButtonRef.current) {
      calendarButtonRef.current.focus();
    }
    wasOpenRef.current = showCalendar;
  }, [showCalendar]);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  const updateCalendarPosition = useCallback(() => {
    const button = calendarButtonRef.current;
    if (!button) {
      return;
    }

    const OFFSET_Y = 12;
    const PANEL_WIDTH = 288;
    const VIEWPORT_PADDING = 16;

    const rect = button.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    const minLeft = VIEWPORT_PADDING;
    const maxLeft = Math.max(
      viewportWidth - PANEL_WIDTH - VIEWPORT_PADDING,
      VIEWPORT_PADDING
    );

    const desiredLeft = Math.min(Math.max(rect.left, minLeft), maxLeft);

    setCalendarPosition({
      top: rect.bottom + OFFSET_Y,
      left: desiredLeft,
    });
  }, []);

  useEffect(() => {
    if (!showCalendar) {
      return undefined;
    }

    updateCalendarPosition();
    window.addEventListener("resize", updateCalendarPosition);
    window.addEventListener("scroll", updateCalendarPosition, true);

    return () => {
      window.removeEventListener("resize", updateCalendarPosition);
      window.removeEventListener("scroll", updateCalendarPosition, true);
    };
  }, [showCalendar, updateCalendarPosition]);

  const handleCalendarToggle = useCallback(() => {
    setShowCalendar((prev) => {
      if (prev) {
        return false;
      }
      updateCalendarPosition();
      return true;
    });
  }, [updateCalendarPosition]);

  useEffect(() => {
    let cancelled = false;

    async function checkUnread() {
      try {
        const response = await apiClient.get("/notifications", {
          params: { limit: 1 },
          headers: { "Cache-Control": "no-cache" },
          withCredentials: true,
        });
        const list = Array.isArray(response.data) ? response.data : [];
        const latest = list[0];
        if (!latest || !latest.createdAt) {
          if (!cancelled) setHasUnreadNotifications(false);
          return;
        }
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            "notification:lastFetchedAt",
            latest.createdAt
          );
          const lastRead = window.localStorage.getItem(
            "notification:lastReadAt"
          );
          const latestTs = new Date(latest.createdAt).getTime();
          const lastReadTs = lastRead ? new Date(lastRead).getTime() : 0;
          if (!cancelled) {
            setHasUnreadNotifications(latestTs > lastReadTs);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setHasUnreadNotifications(false);
        }
      } finally {
        if (!cancelled) {
          setNotificationsLoaded(true);
        }
      }
    }

    checkUnread();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkUnread();
      }
    };

    const handleStorage = (event) => {
      if (event.key === "notification:lastReadAt") {
        checkUnread();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("storage", handleStorage);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleNotificationClick = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "notification:lastReadAt",
        new Date().toISOString()
      );
      setHasUnreadNotifications(false);
    }
    router.push("/notification");
  }, [router]);

  if (loading || !user) {
    return (
      <header
        className="relative z-40"
        style={{ paddingTop: "calc(24px + env(safe-area-inset-top))" }}
      >
        <div className="mx-4 flex items-center justify-between">
          <button
            type="button"
            className="p-0 m-0 bg-transparent border-0 inline-flex items-center justify-center cursor-default"
            style={{ lineHeight: 0 }}
            aria-hidden="true"
          >
            <CalendarIcon size={28} />
          </button>
          <button
            type="button"
            className="p-0 m-0 bg-transparent border-0 inline-flex items-center justify-center cursor-default"
            style={{ lineHeight: 0 }}
            aria-hidden="true"
          >
            <div
              className="h-7 w-7 rounded-full bg-gray-200 animate-pulse"
              aria-hidden="true"
            />
          </button>
        </div>
        <div className="mx-4 mt-6 flex items-start gap-3">
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <h1 className="text-xl font-bold ">
              Hi,
              <span className="ml-2 inline-block h-4 w-32 rounded bg-gray-200 align-middle animate-pulse" />
            </h1>
            <p className="text-[#FEA800] font-semibold text-sm">
              <span
                className="inline-block h-3 w-24 rounded bg-amber-200 animate-pulse"
                aria-hidden="true"
              />
            </p>
            <p className="text-gray-600 text-sm">Let’s make habits together!</p>
          </div>
          <div className="h-14 w-14 shrink-0 rounded-full bg-[#FEA800] shadow animate-pulse" />
        </div>
      </header>
    );
  }

  const displayName = user.username ?? "Teman Herbit";
  const points = user.totalPoints;
  const avatar = (() => {
    if (user.photoUrl) {
      return user.photoUrl;
    }
    const source = displayName;
    const cleaned = source.replace(/[^a-zA-Z\s]/g, " ").trim();
    const initials =
      cleaned
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "T";
    const params = new URLSearchParams({
      name: initials,
      background: "FEA800",
      color: "ffffff",
      size: "128",
    });
    return `https://ui-avatars.com/api/?${params.toString()}`;
  })();
  const calendarPortal = isMounted
    ? createPortal(
        <div className="fixed inset-0 pointer-events-none z-998">
          {showCalendar && (
            <div
              className="absolute pointer-events-auto"
              style={{
                top: `${calendarPosition.top}px`,
                left: `${calendarPosition.left}px`,
              }}
            >
              <CalendarOverlay panelRef={calendarPanelRef} />
            </div>
          )}
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <header
        className="relative z-40"
        style={{ paddingTop: "calc(24px + env(safe-area-inset-top))" }}
      >
        <div className="mx-4 flex items-center justify-between">
          <button
            ref={calendarButtonRef}
            aria-label="Kalender"
            aria-expanded={showCalendar}
            aria-haspopup="dialog"
            onClick={handleCalendarToggle}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCalendarToggle();
              }
            }}
            className="p-0 m-0 bg-transparent border-0 inline-flex items-center justify-center cursor-pointer"
            style={{ lineHeight: 0 }}
            type="button"
          >
            <CalendarIcon size={28} />
          </button>
          {!notificationsLoaded ? (
            <div
              className="h-7 w-7 rounded-full bg-gray-200 animate-pulse"
              aria-hidden="true"
            />
          ) : (
            <button
              aria-label="Notifikasi"
              className="p-0 m-0 bg-transparent border-0 inline-flex items-center justify-center cursor-pointer"
              onClick={handleNotificationClick}
              style={{ lineHeight: 0 }}
              type="button"
            >
              <BellIcon
                size={28}
                color="#111827"
                showIndicator={hasUnreadNotifications}
              />
            </button>
          )}
        </div>
        <div className="mx-4 mt-6 flex items-start gap-3" aria-live="polite">
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <h1 className="text-xl font-bold text-gray-900">
              Hi, <span className="capitalize">{displayName}</span>
            </h1>
            <p className="text-[#FEA800] font-semibold text-sm">
              🏅 {points} Points
            </p>
            <p className="text-gray-600 text-sm">Let’s make habits together!</p>
          </div>
          <div className="h-14 w-14 shrink-0 rounded-full overflow-hidden shadow ring-2 ring-white/60 bg-white">
            <img
              src={avatar}
              alt={`Avatar ${displayName}`}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </header>
      {calendarPortal}
    </>
  );
}
