import { createHash } from "node:crypto";

/**
 * Computes a SHA-256 hexadecimal hash of the given input string.
 * Used for deterministic Redis cache keys (prompt, completion, and embedding caching).
 *
 * @param input - The raw string to hash.
 * @returns 64-character hexadecimal SHA-256 string.
 */
export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}
