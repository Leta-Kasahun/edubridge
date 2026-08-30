import { teacherDirectoryRepository } from "../repository/teacher-directory.repository.js";
import {
  TeacherDirectoryFilterParams,
  TeacherDirectoryResult,
} from "../types/teacher-directory.types.js";

export class TeacherDirectoryService {
  async getDirectory(params: TeacherDirectoryFilterParams): Promise<TeacherDirectoryResult> {
    return teacherDirectoryRepository.findDirectory(params);
  }
}

export const teacherDirectoryService = new TeacherDirectoryService();
