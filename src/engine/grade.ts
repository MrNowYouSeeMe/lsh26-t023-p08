export function getGradePoint(mark: number): number {
  if (!Number.isFinite(mark) || mark < 0 || mark > 100) {
    throw new Error(`Invalid mark: ${mark}`);
  }

  if (mark >= 80) return 5.0;
  if (mark >= 70) return 4.0;
  if (mark >= 60) return 3.5;
  if (mark >= 50) return 3.0;
  if (mark >= 40) return 2.0;
  if (mark >= 33) return 1.0;

  return 0.0;
}

export function roundGpa(gpa: number): number {
  return Math.round((gpa + Number.EPSILON) * 100) / 100;
}

export function getLetterGrade(
  finalGpa: number,
  hasCompulsoryFailure: boolean
): string {
  if (hasCompulsoryFailure) return "F";

  if (finalGpa === 5.0) return "A+";
  if (finalGpa >= 4.0) return "A";
  if (finalGpa >= 3.5) return "A-";
  if (finalGpa >= 3.0) return "B";
  if (finalGpa >= 2.0) return "C";
  if (finalGpa >= 1.0) return "D";

  return "F";
}
