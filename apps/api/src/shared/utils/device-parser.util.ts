import { DeviceType } from "../../generated/prisma/client.js";

export interface ParsedDeviceInfo {
  deviceName: string;
  deviceType: DeviceType;
}

export const parseUserAgent = (userAgent?: string | null): ParsedDeviceInfo => {
  if (!userAgent) {
    return { deviceName: "Unknown Device", deviceType: "WEB" };
  }

  let os = "Unknown OS";
  if (/windows/i.test(userAgent)) os = "Windows";
  else if (/macintosh|mac os x/i.test(userAgent)) os = "macOS";
  else if (/android/i.test(userAgent)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(userAgent)) os = "iOS";
  else if (/linux/i.test(userAgent)) os = "Linux";

  let browser = "Browser";
  if (/edg/i.test(userAgent)) browser = "Edge";
  else if (/chrome|crios/i.test(userAgent)) browser = "Chrome";
  else if (/firefox|fxios/i.test(userAgent)) browser = "Firefox";
  else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = "Safari";
  else if (/opera|opr/i.test(userAgent)) browser = "Opera";

  let deviceType: DeviceType = "WEB";
  if (/mobile/i.test(userAgent) && !/tablet|ipad/i.test(userAgent)) {
    deviceType = "MOBILE";
  } else if (/tablet|ipad/i.test(userAgent)) {
    deviceType = "TABLET";
  }

  return {
    deviceName: `${browser} on ${os}`,
    deviceType,
  };
};
