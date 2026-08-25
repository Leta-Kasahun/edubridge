export function normalizeEthiopianPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");

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

export function formatPhoneDisplay(phone: string): string {
  const normalized = normalizeEthiopianPhone(phone);
  if (!normalized.startsWith("+251") || normalized.length !== 13) {
    return phone;
  }
  const prefix = normalized.slice(0, 4);
  const operator = normalized.slice(4, 6);
  const part1 = normalized.slice(6, 9);
  const part2 = normalized.slice(9, 13);
  return `${prefix} ${operator} ${part1} ${part2}`;
}
