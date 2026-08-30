import type {
  Student,
  SubjectDefinition,
  SubjectMark,
} from "../types/models";

import {
  normalizeHeader,
} from "./parser";

import type {
  ImportIssue,
  ImportValidationResult,
  ParsedImportRow,
  ParsedImportTable,
} from "./types";

const ID_HEADERS = [
  "student_id",
  "studentid",
  "id",
  "roll",
  "roll_no",
  "roll_number",
];

const NAME_HEADERS = [
  "name",
  "student_name",
  "studentname",
];

const CLASS_HEADERS = [
  "class",
  "class_name",
];

const OPTIONAL_HEADERS = [
  "optional",
  "optional_subject",
  "optional_code",
  "fourth_subject",
];

function normalizedValues(
  row: ParsedImportRow
): Record<string, string> {
  const values: Record<string, string> = {};

  Object.entries(row.values).forEach(
    ([key, value]) => {
      values[normalizeHeader(key)] = value.trim();
    }
  );

  return values;
}

function getValue(
  values: Record<string, string>,
  aliases: string[]
): string {
  for (const alias of aliases) {
    const value =
      values[normalizeHeader(alias)];

    if (value !== undefined) {
      return value;
    }
  }

  return "";
}

function hasHeader(
  table: ParsedImportTable,
  aliases: string[]
): boolean {
  const headers = new Set(
    table.headers.map(normalizeHeader)
  );

  return aliases.some(
    (alias) =>
      headers.has(normalizeHeader(alias))
  );
}

function normalAliases(
  subject: SubjectDefinition
): string[] {
  return [
    subject.code,
    subject.name,
  ];
}

function theoryAliases(
  subject: SubjectDefinition
): string[] {
  return [
    `${subject.code}_theory`,
    `${subject.code} theory`,
    `${subject.name}_theory`,
    `${subject.name} theory`,
  ];
}

function practicalAliases(
  subject: SubjectDefinition
): string[] {
  return [
    `${subject.code}_practical`,
    `${subject.code} practical`,
    `${subject.name}_practical`,
    `${subject.name} practical`,
  ];
}

function createIssue(
  row: ParsedImportRow,
  student: string,
  field: string,
  value: string,
  reason: string
): ImportIssue {
  return {
    row: row.rowNumber,
    student:
      student || "Unknown student",
    field,
    value:
      value === ""
        ? "(blank)"
        : value,
    reason,
  };
}

type ParsedMark =
  | {
      kind: "number";
      value: number;
    }
  | {
      kind: "absent";
    }
  | {
      kind: "invalid";
    };

function validateMarkCell(
  row: ParsedImportRow,
  student: string,
  field: string,
  rawValue: string,
  maximum: number,
  issues: ImportIssue[]
): ParsedMark {
  const value = rawValue.trim();

  if (value === "") {
    issues.push(
      createIssue(
        row,
        student,
        field,
        value,
        "Required mark missing."
      )
    );

    return { kind: "invalid" };
  }

  if (value.toUpperCase() === "AB") {
    return { kind: "absent" };
  }

  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    issues.push(
      createIssue(
        row,
        student,
        field,
        value,
        "Must be a number or AB."
      )
    );

    return { kind: "invalid" };
  }

  if (numeric < 0) {
    issues.push(
      createIssue(
        row,
        student,
        field,
        value,
        "Mark cannot be below 0."
      )
    );

    return { kind: "invalid" };
  }

  if (numeric > maximum) {
    issues.push(
      createIssue(
        row,
        student,
        field,
        value,
        `Maximum allowed is ${maximum}.`
      )
    );

    return { kind: "invalid" };
  }

  return {
    kind: "number",
    value: numeric,
  };
}

function findSubject(
  subjects: SubjectDefinition[],
  code: string
): SubjectDefinition | undefined {
  const normalizedCode =
    code.trim().toUpperCase();

  return subjects.find(
    (subject) =>
      subject.code.toUpperCase() ===
      normalizedCode
  );
}

export function validateImportTable(
  table: ParsedImportTable,
  subjects: SubjectDefinition[],
  compulsory: string[]
): ImportValidationResult {
  const schemaErrors: string[] = [];

  if (!hasHeader(table, ID_HEADERS)) {
    schemaErrors.push(
      "Missing student ID column."
    );
  }

  if (!hasHeader(table, NAME_HEADERS)) {
    schemaErrors.push(
      "Missing student name column."
    );
  }

  if (!hasHeader(table, CLASS_HEADERS)) {
    schemaErrors.push(
      "Missing class column."
    );
  }

  if (!hasHeader(table, OPTIONAL_HEADERS)) {
    schemaErrors.push(
      "Missing optional subject column."
    );
  }

  compulsory.forEach((code) => {
    const subject = findSubject(
      subjects,
      code
    );

    if (!subject) {
      schemaErrors.push(
        `Unknown compulsory subject: ${code}.`
      );
      return;
    }

    if (subject.practical) {
      if (
        !hasHeader(
          table,
          theoryAliases(subject)
        )
      ) {
        schemaErrors.push(
          `Missing ${subject.code}_theory column.`
        );
      }

      if (
        !hasHeader(
          table,
          practicalAliases(subject)
        )
      ) {
        schemaErrors.push(
          `Missing ${subject.code}_practical column.`
        );
      }
    } else if (
      !hasHeader(
        table,
        normalAliases(subject)
      )
    ) {
      schemaErrors.push(
        `Missing ${subject.code} column.`
      );
    }
  });

  const accepted: Student[] = [];
  const rejected: ImportValidationResult["rejected"] =
    [];
  const allIssues: ImportIssue[] = [];

  const seenStudentIds =
    new Set<string>();

  for (const row of table.rows) {
    const values = normalizedValues(row);

    const id = getValue(
      values,
      ID_HEADERS
    );

    const name = getValue(
      values,
      NAME_HEADERS
    );

    const className = getValue(
      values,
      CLASS_HEADERS
    );

    const optionalCode = getValue(
      values,
      OPTIONAL_HEADERS
    ).toUpperCase();

    const studentLabel =
      name || id;

    const issues: ImportIssue[] = [];

    if (id === "") {
      issues.push(
        createIssue(
          row,
          studentLabel,
          "Student ID",
          id,
          "Student ID is required."
        )
      );
    } else if (
      seenStudentIds.has(id)
    ) {
      issues.push(
        createIssue(
          row,
          studentLabel,
          "Student ID",
          id,
          "Duplicate student ID."
        )
      );
    }

    if (id !== "") {
      seenStudentIds.add(id);
    }

    if (name === "") {
      issues.push(
        createIssue(
          row,
          studentLabel,
          "Student Name",
          name,
          "Student name is required."
        )
      );
    }

    if (className === "") {
      issues.push(
        createIssue(
          row,
          studentLabel,
          "Class",
          className,
          "Class is required."
        )
      );
    }

    const optionalSubject =
      findSubject(
        subjects,
        optionalCode
      );

    if (optionalCode === "") {
      issues.push(
        createIssue(
          row,
          studentLabel,
          "Optional Subject",
          optionalCode,
          "Optional subject is required."
        )
      );
    } else if (!optionalSubject) {
      issues.push(
        createIssue(
          row,
          studentLabel,
          "Optional Subject",
          optionalCode,
          "Unknown optional subject code."
        )
      );
    } else if (
      compulsory.some(
        (code) =>
          code.toUpperCase() ===
          optionalCode
      )
    ) {
      issues.push(
        createIssue(
          row,
          studentLabel,
          "Optional Subject",
          optionalCode,
          "A compulsory subject cannot also be the optional subject."
        )
      );
    }

    const requiredCodes = [
      ...compulsory,
    ];

    if (
      optionalSubject &&
      !requiredCodes.some(
        (code) =>
          code.toUpperCase() ===
          optionalSubject.code.toUpperCase()
      )
    ) {
      requiredCodes.push(
        optionalSubject.code
      );
    }

    const marks: Record<
      string,
      SubjectMark
    > = {};

    requiredCodes.forEach((code) => {
      const subject = findSubject(
        subjects,
        code
      );

      if (!subject) {
        return;
      }

      if (!subject.practical) {
        const raw = getValue(
          values,
          normalAliases(subject)
        );

        const parsed =
          validateMarkCell(
            row,
            studentLabel,
            subject.name,
            raw,
            100,
            issues
          );

        if (parsed.kind === "number") {
          marks[subject.code] =
            parsed.value;
        }

        if (parsed.kind === "absent") {
          marks[subject.code] = "AB";
        }

        return;
      }

      const theoryRaw = getValue(
        values,
        theoryAliases(subject)
      );

      const practicalRaw = getValue(
        values,
        practicalAliases(subject)
      );

      const theory =
        validateMarkCell(
          row,
          studentLabel,
          `${subject.name} Theory`,
          theoryRaw,
          75,
          issues
        );

      const practical =
        validateMarkCell(
          row,
          studentLabel,
          `${subject.name} Practical`,
          practicalRaw,
          25,
          issues
        );

      if (
        theory.kind === "absent" &&
        practical.kind === "absent"
      ) {
        marks[subject.code] = "AB";
        return;
      }

      if (
        theory.kind === "absent" ||
        practical.kind === "absent"
      ) {
        issues.push(
          createIssue(
            row,
            studentLabel,
            subject.name,
            `Theory=${theoryRaw}, Practical=${practicalRaw}`,
            "For a practical subject, theory and practical must both be AB to represent absence."
          )
        );

        return;
      }

      if (
        theory.kind === "number" &&
        practical.kind === "number"
      ) {
        marks[subject.code] = {
          theory: theory.value,
          practical:
            practical.value,
        };
      }
    });

    if (
      row.values.__extra !== undefined
    ) {
      issues.push(
        createIssue(
          row,
          studentLabel,
          "Row Structure",
          row.values.__extra,
          "Row contains more values than the header defines."
        )
      );
    }

    if (issues.length > 0) {
      allIssues.push(...issues);

      rejected.push({
        rowNumber: row.rowNumber,
        student:
          studentLabel ||
          "Unknown student",
        issues,
      });

      continue;
    }

    accepted.push({
      id,
      name,
      class: className,
      optional:
        optionalSubject!.code,
      marks,
    });
  }

  return {
    accepted,
    rejected,
    issues: allIssues,
    schemaErrors,
  };
}
