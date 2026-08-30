import type {
  ParsedImportRow,
  ParsedImportTable,
} from "./types";

function splitDelimitedLine(
  line: string,
  delimiter: string
): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (
        quoted &&
        line[index + 1] === '"'
      ) {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }

      continue;
    }

    if (char === delimiter && !quoted) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());

  return cells;
}

export function normalizeHeader(
  value: string
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

export function parseMarksTable(
  text: string
): ParsedImportTable {
  const normalized = text
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  const lines = normalized.split("\n");

  const headerIndex = lines.findIndex(
    (line) => line.trim().length > 0
  );

  if (headerIndex === -1) {
    throw new Error(
      "Import data is empty."
    );
  }

  const headerLine = lines[headerIndex];

  const delimiterCharacter =
    headerLine.includes("\t")
      ? "\t"
      : ",";

  const delimiter =
    delimiterCharacter === "\t"
      ? "tab"
      : "comma";

  const headers = splitDelimitedLine(
    headerLine,
    delimiterCharacter
  );

  if (headers.length < 2) {
    throw new Error(
      "Could not detect a valid CSV or pasted table header."
    );
  }

  const normalizedHeaders =
    headers.map(normalizeHeader);

  const duplicateHeaders =
    normalizedHeaders.filter(
      (header, index) =>
        normalizedHeaders.indexOf(header) !== index
    );

  if (duplicateHeaders.length > 0) {
    throw new Error(
      `Duplicate header found: ${duplicateHeaders[0]}`
    );
  }

  const rows: ParsedImportRow[] = [];

  for (
    let lineIndex = headerIndex + 1;
    lineIndex < lines.length;
    lineIndex += 1
  ) {
    const line = lines[lineIndex];

    if (line.trim().length === 0) {
      continue;
    }

    const cells = splitDelimitedLine(
      line,
      delimiterCharacter
    );

    const values: Record<string, string> = {};

    headers.forEach((header, index) => {
      values[header] =
        cells[index]?.trim() ?? "";
    });

    if (cells.length > headers.length) {
      values.__extra = cells
        .slice(headers.length)
        .join(delimiterCharacter);
    }

    rows.push({
      rowNumber: lineIndex + 1,
      values,
    });
  }

  return {
    headers,
    rows,
    delimiter,
  };
}
