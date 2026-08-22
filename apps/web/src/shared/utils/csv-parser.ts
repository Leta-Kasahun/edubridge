export interface CsvParsedRow {
  readonly rowNumber: number;
  readonly raw: Record<string, string>;
  readonly isValid: boolean;
  readonly errors: readonly string[];
}

export interface CsvParseResult {
  readonly headers: readonly string[];
  readonly rows: readonly CsvParsedRow[];
  readonly totalRows: number;
  readonly validRowCount: number;
  readonly invalidRowCount: number;
}

export function normalizeCsvHeader(header: string): string {
  const cleaned = header.trim().replace(/^["']|["']$/g, "");
  return cleaned
    .replace(/[-_\s]+(.)?/g, (_, char: string | undefined) =>
      char ? char.toUpperCase() : ""
    )
    .replace(/^(.)/, (char: string) => char.toLowerCase());
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

export function parseCsvString(
  content: string,
  requiredColumns: readonly string[] = []
): CsvParseResult {
  const normalizedText = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rawLines = normalizedText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (rawLines.length === 0) {
    return {
      headers: [],
      rows: [],
      totalRows: 0,
      validRowCount: 0,
      invalidRowCount: 0,
    };
  }

  const firstLine = rawLines[0] ?? "";
  const rawHeaders = parseCsvLine(firstLine);
  const headers = rawHeaders.map((h) => normalizeCsvHeader(h));

  const rows: CsvParsedRow[] = [];
  let validRowCount = 0;
  let invalidRowCount = 0;

  for (let i = 1; i < rawLines.length; i += 1) {
    const rowNumber = i + 1;
    const currentLine = rawLines[i] ?? "";
    const values = parseCsvLine(currentLine);
    const raw: Record<string, string> = {};
    const errors: string[] = [];

    for (let hIndex = 0; hIndex < headers.length; hIndex += 1) {
      const key = headers[hIndex];
      const val = values[hIndex] !== undefined ? (values[hIndex] as string) : "";
      if (key) {
        raw[key] = val;
      }
    }

    for (const requiredCol of requiredColumns) {
      const cell = raw[requiredCol];
      if (!cell || cell.trim().length === 0) {
        errors.push(`Missing required field: ${requiredCol}`);
      }
    }

    const isValid = errors.length === 0;
    if (isValid) {
      validRowCount += 1;
    } else {
      invalidRowCount += 1;
    }

    rows.push({
      rowNumber,
      raw,
      isValid,
      errors,
    });
  }

  return {
    headers,
    rows,
    totalRows: rows.length,
    validRowCount,
    invalidRowCount,
  };
}

export async function parseCsvFile(
  file: File,
  requiredColumns: readonly string[] = []
): Promise<CsvParseResult> {
  const content = await file.text();
  return parseCsvString(content, requiredColumns);
}
