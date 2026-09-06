import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import {
  TeacherAssignmentListItem,
  CreateTeacherAssignmentInput,
  ReassignTeacherAssignmentInput,
  EndTeacherAssignmentInput,
  TeacherLoadSummary,
  TeacherAssignmentFilters,
  PaginatedTeacherAssignmentsResponse,
} from "../types/teacher-assignment.types";
import { PaginationMeta } from "@/shared/types";

interface ApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly pagination?: PaginationMeta;
  readonly message?: string;
  readonly error?: string;
}

export class TeacherAssignmentService {
  async getAssignments(
    filters: TeacherAssignmentFilters
  ): Promise<PaginatedTeacherAssignmentsResponse> {
    if (!filters.academicYearId && !filters.teacherId) {
      return {
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
      };
    }

    const params = new URLSearchParams();
    if (filters.academicYearId) params.set("academicYearId", filters.academicYearId);
    if (filters.gradeId) params.set("gradeId", filters.gradeId);
    if (filters.sectionId) params.set("sectionId", filters.sectionId);
    if (filters.subjectId) params.set("subjectId", filters.subjectId);
    if (filters.teacherId) params.set("teacherId", filters.teacherId);
    if (filters.role) params.set("role", filters.role);
    if (filters.search) params.set("search", filters.search);
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));

    const res = await apiClient.get<ApiResponse<readonly TeacherAssignmentListItem[]>>(
      `${API_ENDPOINTS.ACADEMIC_TEACHER_ASSIGNMENTS.BASE}?${params.toString()}`
    );

    return {
      items: res.data.data || [],
      pagination: res.data.pagination || {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total: (res.data.data || []).length,
        totalPages: 1,
      },
    };
  }

  async createAssignment(
    input: CreateTeacherAssignmentInput
  ): Promise<TeacherAssignmentListItem> {
    const res = await apiClient.post<ApiResponse<TeacherAssignmentListItem>>(
      API_ENDPOINTS.ACADEMIC_TEACHER_ASSIGNMENTS.BASE,
      input
    );

    if (!res.data.data) {
      throw new Error("Failed to create teacher assignment");
    }

    return res.data.data;
  }

  async reassignAssignment(
    assignmentId: string,
    input: ReassignTeacherAssignmentInput
  ): Promise<TeacherAssignmentListItem> {
    const res = await apiClient.post<ApiResponse<TeacherAssignmentListItem>>(
      API_ENDPOINTS.ACADEMIC_TEACHER_ASSIGNMENTS.REASSIGN(assignmentId),
      input
    );

    if (!res.data.data) {
      throw new Error("Failed to reassign teacher");
    }

    return res.data.data;
  }

  async endAssignment(
    assignmentId: string,
    input: EndTeacherAssignmentInput
  ): Promise<void> {
    await apiClient.post<ApiResponse<void>>(
      API_ENDPOINTS.ACADEMIC_TEACHER_ASSIGNMENTS.END(assignmentId),
      input
    );
  }

  async getTeacherLoadSummary(
    teacherId: string,
    academicYearId: string
  ): Promise<TeacherLoadSummary> {
    const params = new URLSearchParams({ academicYearId });
    const res = await apiClient.get<ApiResponse<TeacherLoadSummary>>(
      `${API_ENDPOINTS.ACADEMIC_TEACHER_ASSIGNMENTS.LOAD_SUMMARY(teacherId)}?${params.toString()}`
    );

    if (!res.data.data) {
      throw new Error("Failed to load teacher load summary");
    }

    return res.data.data;
  }
}

export const teacherAssignmentService = new TeacherAssignmentService();
