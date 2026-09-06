import {
  studentClassRepository,
  StudentClassRepository,
} from "../repository/student-class.repository.js";
import { StudentMyClassResponse } from "../types/student-class.types.js";

export class StudentClassService {
  constructor(
    private readonly repo: StudentClassRepository = studentClassRepository
  ) {}

  async getMyClass(
    tenantId: string,
    userId: string
  ): Promise<StudentMyClassResponse> {
    return this.repo.findStudentClass(tenantId, userId);
  }
}

export const studentClassService = new StudentClassService();
