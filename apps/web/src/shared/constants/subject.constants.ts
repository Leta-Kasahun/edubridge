export interface StandardSubjectDefinition {
  readonly code: string;
  readonly name: string;
  readonly defaultGrades: readonly number[];
  readonly category: "CORE" | "ELECTIVE" | "STREAM_SPECIFIC";
}

export const ETHIOPIAN_STANDARD_SUBJECTS: readonly StandardSubjectDefinition[] = [
  { code: "MATH", name: "Mathematics", defaultGrades: [7, 8, 9, 10, 11, 12], category: "CORE" },
  { code: "ENG", name: "English", defaultGrades: [7, 8, 9, 10, 11, 12], category: "CORE" },
  { code: "PHYS", name: "Physics", defaultGrades: [9, 10, 11, 12], category: "CORE" },
  { code: "CHEM", name: "Chemistry", defaultGrades: [9, 10, 11, 12], category: "CORE" },
  { code: "BIO", name: "Biology", defaultGrades: [9, 10, 11, 12], category: "CORE" },
  { code: "HIST", name: "History", defaultGrades: [9, 10, 11, 12], category: "CORE" },
  { code: "GEOG", name: "Geography", defaultGrades: [9, 10, 11, 12], category: "CORE" },
  { code: "ECON", name: "Economics", defaultGrades: [11, 12], category: "STREAM_SPECIFIC" },
  { code: "CIVIC", name: "Citizenship Education", defaultGrades: [7, 8, 9, 10, 11, 12], category: "CORE" },
  { code: "GENSCI", name: "General Science", defaultGrades: [7, 8], category: "CORE" },
  { code: "SOCST", name: "Social Studies", defaultGrades: [7, 8], category: "CORE" },
];

export const SUBJECT_AVAILABLE_GRADE_LEVELS = [7, 8, 9, 10, 11, 12] as const;
export type SubjectAvailableGradeLevel = (typeof SUBJECT_AVAILABLE_GRADE_LEVELS)[number];
