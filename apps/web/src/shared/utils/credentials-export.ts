export interface CredentialExportRow {
  readonly fullName: string;
  readonly username: string;
  readonly password: string;
}

export function escapeCsvValue(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export function generateCredentialsCsv(rows: readonly CredentialExportRow[]): string {
  const header = "Full Name,Username,Password";
  const body = rows
    .map((r) => `${escapeCsvValue(r.fullName)},${escapeCsvValue(r.username)},${escapeCsvValue(r.password)}`)
    .join("\n");
  return `\uFEFF${header}\n${body}`;
}

export function downloadCredentialsCsv(rows: readonly CredentialExportRow[], fileName = "credentials.csv"): void {
  const csvContent = generateCredentialsCsv(rows);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
