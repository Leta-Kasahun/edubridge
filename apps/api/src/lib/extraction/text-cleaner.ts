import { BadRequestError } from "../../shared/exceptions/bad-request-error.js";
import type { ExtractedDocument } from "./extraction.types.js";

export interface CleanedPage {
  readonly pageNumber: number;
  readonly text: string;
  readonly isEmpty: boolean;
}

export interface CleanedDocument {
  readonly pages: CleanedPage[];
  readonly fullText: string;
  readonly stats: {
    readonly originalCharCount: number;
    readonly cleanedCharCount: number;
    readonly removedBoilerplateLines: number;
    readonly pagesSkipped: number;
  };
}

// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const PAGE_NUMBER_REGEX = /^\s*\d{1,4}\s*$/;
const PAGE_N_OF_M_REGEX = /^\s*page\s+\d+\s*(of\s+\d+)?\s*$/i;
const BROKEN_WORD_REGEX = /(\w)-\n(\w)/g;

/**
 * Stage 2 pure text cleaning pipeline for extracted document pages.
 */
export function cleanDocument(doc: ExtractedDocument): CleanedDocument {
  const originalCharCount = doc.fullText.length;
  let removedBoilerplateLines = 0;

  // Track frequent short lines across pages (headers/footers)
  const lineFrequency = new Map<string, number>();
  const pageLinesList: string[][] = [];

  for (const page of doc.pages) {
    const rawLines = normalizeRawText(page.text).split("\n");
    const normalizedLines: string[] = [];

    for (const rawLine of rawLines) {
      const line = rawLine.trim();
      normalizedLines.push(line);

      if (line.length > 0 && line.length < 80) {
        lineFrequency.set(line, (lineFrequency.get(line) ?? 0) + 1);
      }
    }
    pageLinesList.push(normalizedLines);
  }

  // Identify boilerplate appearing in >= 50% of pages (min 3 occurrences)
  const threshold = Math.max(3, Math.ceil(doc.pages.length * 0.5));
  const boilerplateLines = new Set<string>();

  if (doc.pages.length >= 3) {
    for (const [line, count] of lineFrequency.entries()) {
      if (count >= threshold) {
        boilerplateLines.add(line);
      }
    }
  }

  const cleanedPages: CleanedPage[] = [];
  let pagesSkipped = 0;

  for (let i = 0; i < doc.pages.length; i++) {
    const lines = pageLinesList[i] ?? [];
    const filteredLines: string[] = [];

    for (const line of lines) {
      // Strip standalone page numbers and repeated header/footer boilerplate
      if (PAGE_NUMBER_REGEX.test(line) || PAGE_N_OF_M_REGEX.test(line) || boilerplateLines.has(line)) {
        removedBoilerplateLines++;
        continue;
      }
      filteredLines.push(line);
    }

    // Collapse whitespace and join lines
    let pageText = filteredLines
      .join("\n")
      .replace(BROKEN_WORD_REGEX, "$1$2") // Repair hyphenated line-break words
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    const isEmpty = pageText.length < 30;
    if (isEmpty) {
      pagesSkipped++;
      pageText = "";
    }

    cleanedPages.push({
      pageNumber: i + 1,
      text: pageText,
      isEmpty,
    });
  }

  const fullText = cleanedPages
    .filter((p) => !p.isEmpty)
    .map((p) => p.text)
    .join("\n\n");

  if (fullText.length < 100) {
    throw new BadRequestError("Document appears empty or unreadable after cleaning.");
  }

  return {
    pages: cleanedPages,
    fullText,
    stats: {
      originalCharCount,
      cleanedCharCount: fullText.length,
      removedBoilerplateLines,
      pagesSkipped,
    },
  };
}

function normalizeRawText(text: string): string {
  return text
    .normalize("NFC") // Canonical Unicode normalization
    .replace(CONTROL_CHARS_REGEX, "") // Strip non-printable control chars
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}
