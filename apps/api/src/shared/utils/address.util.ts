export interface AddressValidationPayload {
  readonly regionId?: string | null;
  readonly zoneId?: string | null;
  readonly woredaId?: string | null;
  readonly kebeleId?: string | null;
  readonly cityId?: string | null;
  readonly subCityId?: string | null;
  readonly specificLocation?: string | null;
}

export interface AddressValidationResult {
  readonly isValid: boolean;
  readonly error?: string;
}

export interface AddressDisplayParts {
  readonly regionName?: string | null;
  readonly zoneName?: string | null;
  readonly woredaName?: string | null;
  readonly kebeleName?: string | null;
  readonly cityName?: string | null;
  readonly subCityName?: string | null;
  readonly specificLocation?: string | null;
}

export function validateAddressHierarchy(
  address: AddressValidationPayload
): AddressValidationResult {
  const isCityBased = Boolean(address.cityId);
  const isRegionalBased = Boolean(address.regionId);

  if (!isCityBased && !isRegionalBased && !address.specificLocation) {
    return {
      isValid: false,
      error: "Address requires either a city, regional hierarchy, or specific location",
    };
  }

  if (address.subCityId && !address.cityId) {
    return {
      isValid: false,
      error: "Sub-city requires an associated city",
    };
  }

  if (address.woredaId && !address.zoneId) {
    return {
      isValid: false,
      error: "Woreda requires an associated zone",
    };
  }

  if (address.zoneId && !address.regionId) {
    return {
      isValid: false,
      error: "Zone requires an associated region",
    };
  }

  return { isValid: true };
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
