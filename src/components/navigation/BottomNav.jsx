"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MaskIcon from "@/components/ui/MaskIcon";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import apiClient from "@/lib/apiClient";
import { DEFAULT_TABS } from "@/constants";

const AUTH_RESERVED_SEGMENTS = new Set([
  "",
  "login",
  "register",
  "forgot-password",
  "reset-password",
  "settings",
]);

const FEATURE_SEGMENTS = DEFAULT_TABS.map((tab) => {
  if (!tab?.href || tab.href === "/") return null;
  const firstSegment = tab.href.split("/").filter(Boolean)[0] ?? null;
  return firstSegment;
}).filter(Boolean);

const RESERVED_SEGMENTS = new Set([
  ...AUTH_RESERVED_SEGMENTS,
  ...FEATURE_SEGMENTS,
]);

export default function BottomNav({
  tabs,
  activeColor = "#FEA800",
  inactiveColor = "#D1D5DB",
  className = "",
}) {
  const pathname = usePathname();

  const username = useMemo(() => {
    if (!pathname) return null;
    const match = pathname.match(/^\/([^/]+)/);
    const candidate = match?.[1] ?? null;
    if (!candidate || RESERVED_SEGMENTS.has(candidate)) {
      return null;
    }
    return candidate;
  }, [pathname]);

  const [profileHref, setProfileHref] = useState(null);

  useEffect(() => {
    if (username) {
      setProfileHref(`/${username}/aktivitas`);
      return undefined;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function fetchProfileHref() {
      try {
        const response = await apiClient.get("/users/home-summary", {
          headers: { "Cache-Control": "no-cache" },
          signal: controller.signal,
        });
        const payload = response.data ?? {};
        const data =
          payload && typeof payload === "object" && typeof payload.data === "object"
            ? payload.data
            : payload;
        const fallbackUsername = data?.user?.username ?? null;
        if (!cancelled && fallbackUsername) {
          setProfileHref(`/${fallbackUsername}/aktivitas`);
        }
      } catch (error) {
        if (axios.isCancel(error)) return;
        // ignore fetch errors silently
      }
    }

    fetchProfileHref();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [username]);

  const isActive = ({ href, matchPrefix = true, matchPattern }) => {
    if (matchPattern && pathname) {
      const pattern =
        typeof matchPattern === "string"
          ? new RegExp(matchPattern, "i")
          : matchPattern;
      return pattern.test(pathname);
    }
    if (href === "/") return pathname === "/";
    return matchPrefix ? pathname?.startsWith(href) : pathname === href;
  };

  const resolvedTabs = useMemo(() => {
    return tabs.map((tab) => {
      if (tab.key === "profile") {
        const resolvedHref =
          profileHref ?? tab.href ?? pathname ?? "/";
        const disabled = !profileHref;

        return {
          ...tab,
          href: resolvedHref,
          matchPrefix: false,
          disabled,
        };
      }
      return tab;
    });
  }, [tabs, profileHref, pathname]);

  return (
    <nav
      role="navigation"
      aria-label="Bottom navigation"
      className={`fixed inset-x-0 bottom-[33px] z-50 pointer-events-none ${className}`}
    >
      <div
        className="
          pointer-events-auto relative mx-[16.5px]
          w-[calc(100%-33px)] h-[64px]
          flex items-center justify-between px-[24px]
          rounded-[64px] overflow-hidden
          bg-white/15 dark:bg-zinc-900/15
          backdrop-blur-3xl border border-white/40 dark:border-white/10
          ring-1 ring-inset ring-white/30 dark:ring-white/5
          shadow-[0_20px_40px_rgba(0,0,0,0.20)]
        "
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-[64px] shadow-[inset_0_-6px_12px_rgba(255,255,255,0.2),inset_0_6px_12px_rgba(0,0,0,0.08)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-1 h-5 rounded-[48px] bg-white/45 dark:bg-white/10 blur-md"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-0 h-full w-32
                     bg-gradient-to-r from-transparent via-white/40 to-transparent
                     blur-xl animate-[sweep_4s_ease-in-out_infinite]"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black, transparent)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='table' tableValues='0 0.6'/></feComponentTransfer></filter><rect width='120' height='120' filter='url(%23n)'/></svg>\")",
            backgroundSize: "120px 120px",
          }}
        />

        <ul className="relative z-10 flex w-full items-center justify-between">
          {resolvedTabs.map(
            ({
              key,
              href,
              label,
              icon,
              matchPrefix = true,
              matchPattern,
              disabled = false,
            }) => {
              const active = !disabled
                ? isActive({ href, matchPrefix, matchPattern })
                : false;
              const linkClassName = [
                "flex flex-col items-center gap-1",
                "transition-transform duration-200 ease-out hover:scale-[1.05]",
                disabled ? "pointer-events-none opacity-60" : "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <li key={key} className="flex flex-col itemscenter gap-1">
                  <Link
                    href={href}
                    aria-label={label}
                    aria-current={active ? "page" : undefined}
                    aria-disabled={disabled || undefined}
                    tabIndex={disabled ? -1 : 0}
                    className={linkClassName}
                    style={{ transform: active ? "scale(1.06)" : "scale(1)" }}
                  >
                    <MaskIcon
                      name={icon}
                      size={24}
                      color={active ? activeColor : inactiveColor}
                    />
                    <span
                      className={`text-[12px] leading-none ${
                        active ? "font-medium" : ""
                      }`}
                      style={{ color: active ? activeColor : inactiveColor }}
                    >
                      {label}
                    </span>
                  </Link>
                </li>
              );
            }
          )}
        </ul>
      </div>
    </nav>
  );
}
