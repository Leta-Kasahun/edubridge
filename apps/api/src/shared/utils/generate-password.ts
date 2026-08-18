import crypto from "node:crypto";

export const generateRandomPassword = (length = 12): string => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join("");
};
