import type { Student } from "../types/models";

export interface ParsedImportRow {
  rowNumber: number;
  values: Record<string, string>;
}

export interface ParsedImportTable {
  headers: string[];
  rows: ParsedImportRow[];
  delimiter: "tab" | "comma";
}

export interface ImportIssue {
  row: number;
  student: string;
  field: string;
  value: string;
  reason: string;
}

export interface RejectedImportRow {
  rowNumber: number;
  student: string;
  issues: ImportIssue[];
}

export interface ImportValidationResult {
  accepted: Student[];
  rejected: RejectedImportRow[];
  issues: ImportIssue[];
  schemaErrors: string[];
}
