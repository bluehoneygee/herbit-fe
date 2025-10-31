export const DEFAULT_TABS = [
  { key: "home", href: "/", label: "Home", icon: "home", matchPrefix: false },
  { key: "habit", href: "/tracker", label: "Habit", icon: "habit" },
  { key: "eco", href: "/eco-enzyme", label: "Eco", icon: "eco" },
  { key: "game", href: "/game", label: "Game", icon: "game" },
  {
    key: "profile",
    href: undefined,
    label: "Profile",
    icon: "profile",
    matchPrefix: false,
    matchPattern: "^/[^/]+/(aktivitas|rewards)(/.*)?$",
  },
];
