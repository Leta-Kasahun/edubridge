export function getAvatarInitials(name?: string | null, fallback = "U"): string {
  if (!name || !name.trim()) {
    return fallback.toUpperCase();
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const firstInitial = parts[0]?.charAt(0) ?? "";
    const middleInitial = parts[1]?.charAt(0) ?? "";
    return `${firstInitial}${middleInitial}`.toUpperCase() || fallback.toUpperCase();
  }

  if (parts.length === 1 && parts[0]) {
    return parts[0].charAt(0).toUpperCase() || fallback.toUpperCase();
  }

  return fallback.toUpperCase();
}

export function getAvatarInitialsFromParts(
  firstName?: string | null,
  middleName?: string | null,
  lastName?: string | null,
  fallback = "U"
): string {
  const cleanFirst = firstName?.trim() ?? "";
  const cleanMiddle = middleName?.trim() ?? "";
  const cleanLast = lastName?.trim() ?? "";

  if (cleanFirst && cleanMiddle) {
    return `${cleanFirst.charAt(0)}${cleanMiddle.charAt(0)}`.toUpperCase();
  }

  if (cleanFirst && cleanLast) {
    return `${cleanFirst.charAt(0)}${cleanLast.charAt(0)}`.toUpperCase();
  }

  if (cleanFirst) {
    return cleanFirst.charAt(0).toUpperCase();
  }

  if (cleanLast) {
    return cleanLast.charAt(0).toUpperCase();
  }

  return fallback.toUpperCase();
}
