import { z } from "zod";

export interface ParsedCsvResult<T> {
  readonly headers: readonly string[];
  readonly rows: readonly ParsedRow<T>[];
  readonly totalRows: number;
  readonly validRows: readonly T[];
  readonly invalidRows: readonly InvalidRow[];
}

export interface ParsedRow<T> {
  readonly rowNumber: number;
  readonly raw: Record<string, string>;
  readonly data?: T;
  readonly errors?: readonly string[];
  readonly isValid: boolean;
}

export interface InvalidRow {
  readonly rowNumber: number;
  readonly raw: Record<string, string>;
  readonly errors: readonly string[];
}

export function normalizeHeaderKey(header: string): string {
  const cleaned = header.trim().replace(/^["']|["']$/g, "");
  const camelCase = cleaned
    .replace(/[-_\s]+(.)?/g, (_, char: string | undefined) =>
      char ? char.toUpperCase() : ""
    )
    .replace(/^(.)/, (char: string) => char.toLowerCase());
  return camelCase;
}

export function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let currentField = "";
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        currentField += '"';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
      i += 1;
      continue;
    }

    if (char === "," && !inQuotes) {
      fields.push(currentField.trim());
      currentField = "";
      i += 1;
      continue;
    }

    currentField += char;
    i += 1;
  }

  fields.push(currentField.trim());
  return fields;
}

export function parseCsvText<T>(
  csvContent: string,
  schema?: z.ZodType<T>,
  headerAliasMap?: Record<string, string>
): ParsedCsvResult<T> {
  const normalizedText = csvContent.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rawLines = normalizedText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (rawLines.length === 0) {
    return {
      headers: [],
      rows: [],
      totalRows: 0,
      validRows: [],
      invalidRows: [],
    };
  }

  const firstLine = rawLines[0] ?? "";
  const rawHeaders = parseCsvLine(firstLine);
  const mappedHeaders = rawHeaders.map((h) => {
    const normalized = normalizeHeaderKey(h);
    if (headerAliasMap && headerAliasMap[normalized]) {
      return headerAliasMap[normalized] as string;
    }
    return normalized;
  });

  const parsedRows: ParsedRow<T>[] = [];
  const validRows: T[] = [];
  const invalidRows: InvalidRow[] = [];

  for (let index = 1; index < rawLines.length; index += 1) {
    const rowNumber = index + 1;
    const currentLine = rawLines[index] ?? "";
    const values = parseCsvLine(currentLine);
    const rowObject: Record<string, string> = {};

    for (let hIndex = 0; hIndex < mappedHeaders.length; hIndex += 1) {
      const headerKey = mappedHeaders[hIndex];
      const cellValue = values[hIndex] !== undefined ? (values[hIndex] as string) : "";
      if (headerKey) {
        rowObject[headerKey] = cellValue;
      }
    }

    if (schema) {
      const validationResult = schema.safeParse(rowObject);
      if (validationResult.success) {
        parsedRows.push({
          rowNumber,
          raw: rowObject,
          data: validationResult.data,
          isValid: true,
        });
        validRows.push(validationResult.data);
      } else {
        const errorMessages = validationResult.error.issues.map(
          (issue) => `${issue.path.join(".") || "field"}: ${issue.message}`
        );
        parsedRows.push({
          rowNumber,
          raw: rowObject,
          errors: errorMessages,
          isValid: false,
        });
        invalidRows.push({
          rowNumber,
          raw: rowObject,
          errors: errorMessages,
        });
      }
    } else {
      const untypedData = rowObject as unknown as T;
      parsedRows.push({
        rowNumber,
        raw: rowObject,
        data: untypedData,
        isValid: true,
      });
      validRows.push(untypedData);
    }
  }

  return {
    headers: mappedHeaders,
    rows: parsedRows,
    totalRows: parsedRows.length,
    validRows,
    invalidRows,
  };
}
