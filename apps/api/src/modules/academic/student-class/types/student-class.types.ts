export interface StudentClassSectionInfo {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly gradeLevel: number;
  readonly gradeName: string;
  readonly academicYearName: string;
}

export interface StudentHomeroomTeacherInfo {
  readonly fullName: string;
  readonly photoUrl: string | null;
}

export interface StudentSubjectTeacherInfo {
  readonly subjectName: string;
  readonly subjectCode: string;
  readonly teacherFullName: string;
  readonly photoUrl: string | null;
}

export interface StudentMyClassResponse {
  readonly section: StudentClassSectionInfo | null;
  readonly homeroomTeacher: StudentHomeroomTeacherInfo | null;
  readonly subjectTeachers: readonly StudentSubjectTeacherInfo[];
}
