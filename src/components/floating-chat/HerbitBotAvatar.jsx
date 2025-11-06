"use client";

import clsx from "clsx";

export default function HerbitBotAvatar({ className, mood = "smile" }) {
  const mouthPath = mood === "wave" ? "M12 18c1.5 1 4.5 1 6 0" : "M12 18c1 1.5 4 1.5 5 0";

  return (
    <svg
      viewBox="0 0 64 80"
      aria-hidden="true"
      className={clsx("drop-shadow-md", className)}
    >
      <defs>
        <linearGradient id="botBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f6f6f6" />
          <stop offset="100%" stopColor="#d6d6d6" />
        </linearGradient>
        <linearGradient id="botShadow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1b1b25" />
          <stop offset="100%" stopColor="#0f0f14" />
        </linearGradient>
      </defs>

      <g transform="translate(4,4)">
        <rect
          x="22"
          y="-6"
          width="12"
          height="12"
          rx="6"
          fill="#d4a73c"
        />
        <line
          x1="28"
          y1="6"
          x2="28"
          y2="12"
          stroke="#d4a73c"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <rect
          x="4"
          y="12"
          width="48"
          height="34"
          rx="18"
          fill="url(#botBody)"
          stroke="#fefefe"
          strokeWidth="1.5"
        />

        <rect
          x="12"
          y="18"
          width="32"
          height="22"
          rx="11"
          fill="url(#botShadow)"
        />

        <circle cx="22" cy="28" r="4" fill="#ff5b54" />
        <circle cx="34" cy="28" r="4" fill="#ff5b54" />
        <path
          d={mouthPath}
          stroke="#ff8654"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        <g transform="translate(0,36)">
          <path
            d="M18 0h20c6 0 10 4 10 10v6c0 6-4 10-10 10H18c-6 0-10-4-10-10v-6C8 4 12 0 18 0Z"
            fill="url(#botBody)"
            stroke="#fefefe"
            strokeWidth="1.5"
          />
          <circle cx="28" cy="12" r="6" fill="#ff5b54" />
          <path
            d="M26 26v10c0 1.5 1.2 3 2 3s2-1.5 2-3V26"
            fill="#a3a3ad"
          />
        </g>

        <g stroke="#d4a73c" strokeWidth="3.5" strokeLinecap="round" fill="none">
          <path d="M4 34c-4 4-4 11 0 15" />
          <path d="M52 34c4 4 4 11 0 15" />
        </g>
        <g stroke="#5c5c68" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M6 35c-3 3-3 9 0 12" />
          <path d="M50 35c3 3 3 9 0 12" />
        </g>
        <circle cx="6" cy="47" r="3.2" fill="#d4a73c" />
        <circle cx="50" cy="47" r="3.2" fill="#d4a73c" />
      </g>
    </svg>
  );
}
