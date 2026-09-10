export function normalizeEthiopianPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, "");

  if (cleaned.startsWith("+251")) {
    return cleaned;
  }

  if (cleaned.startsWith("251")) {
    return `+${cleaned}`;
  }

  if (cleaned.startsWith("09") || cleaned.startsWith("07")) {
    return `+251${cleaned.slice(1)}`;
  }

  if (cleaned.startsWith("9") || cleaned.startsWith("7")) {
    return `+251${cleaned}`;
  }

  return cleaned;
}

export function isValidEthiopianPhone(phone: string): boolean {
  if (!phone) return false;
  const normalized = normalizeEthiopianPhone(phone);
  return /^\+251(9|7)[0-9]{8}$/.test(normalized);
}
