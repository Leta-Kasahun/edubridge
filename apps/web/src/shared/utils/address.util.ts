export interface AddressDisplayParts {
  readonly regionName?: string | null;
  readonly zoneName?: string | null;
  readonly woredaName?: string | null;
  readonly kebeleName?: string | null;
  readonly cityName?: string | null;
  readonly subCityName?: string | null;
  readonly specificLocation?: string | null;
}

export function formatFullAddress(parts: AddressDisplayParts): string {
  const segments: string[] = [];

  if (parts.specificLocation?.trim()) {
    segments.push(parts.specificLocation.trim());
  }

  if (parts.kebeleName?.trim()) {
    segments.push(`Kebele ${parts.kebeleName.trim()}`);
  }

  if (parts.subCityName?.trim()) {
    segments.push(parts.subCityName.trim());
  }

  if (parts.woredaName?.trim()) {
    segments.push(`Woreda ${parts.woredaName.trim()}`);
  }

  if (parts.cityName?.trim()) {
    segments.push(parts.cityName.trim());
  }

  if (parts.zoneName?.trim()) {
    segments.push(parts.zoneName.trim());
  }

  if (parts.regionName?.trim()) {
    segments.push(parts.regionName.trim());
  }

  return segments.join(", ");
}
