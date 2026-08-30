export type PracticalMark = {
  theory: number;
  practical: number;
};

export type SubjectMark = number | "AB" | PracticalMark;

export interface SubjectDefinition {
  code: string;
  name: string;
  practical: boolean;
}

export interface Student {
  id: string;
  name: string;
  class: string;
  optional: string;
  marks: Record<string, SubjectMark>;
}

export interface ResultCase {
  case_id: string;
  subjects: SubjectDefinition[];
  compulsory: string[];
  students: Student[];
}

export type SubjectStatus = "PASS" | "FAIL" | "AB";

export interface SubjectEvaluation {
  subjectCode: string;
  subjectName: string;
  practicalSubject: boolean;

  status: SubjectStatus;
  absent: boolean;

  totalMark: number | null;
  gradePoint: number;

  theoryMark: number | null;
  practicalMark: number | null;

  theoryPassed: boolean | null;
  practicalPassed: boolean | null;

  failureReasons: string[];
  rule: string;
}

export interface StudentResult {
  student: Student;

  compulsoryResults: SubjectEvaluation[];
  optionalResult: SubjectEvaluation;

  compulsoryGpSum: number;

  optionalGp: number;
  optionalBonus: number;

  uncappedGpa: number;
  uncancelledGpa: number;

  hasCompulsoryFailure: boolean;
  failedCompulsorySubjects: string[];

  finalGpa: number;
  letterGrade: string;

  flags: {
    optionalReview: boolean;
    practicalFail: boolean;
    absent: boolean;
  };
}

export interface CheckingLists {
  optionalReview: StudentResult[];
  practicalFail: StudentResult[];
  absent: StudentResult[];
}
