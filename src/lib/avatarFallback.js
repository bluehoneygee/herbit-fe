export function getFallbackAvatar(displayName, options = {}) {
  const source = displayName || "Teman Herbit";
  const cleaned = source.replace(/[^a-zA-Z\s]/g, " ").trim();
  const initials =
    cleaned
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "TH";

  const background = options.background ?? "FEA800";
  const color = options.color ?? "ffffff";
  const size = options.size ?? "128";

  const params = new URLSearchParams({
    name: initials,
    background,
    color,
    size,
  });

  return `https://ui-avatars.com/api/?${params.toString()}`;
}

export default getFallbackAvatar;
