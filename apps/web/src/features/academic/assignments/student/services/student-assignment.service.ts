import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import {
  StudentRosterItem,
  StudentEnrollmentHistoryItem,
  SectionCapacityInfo,
  SingleTransferInput,
  BulkTransferInput,
  PromotionPreviewQuery,
  PromotionPreviewResult,
  CommitPromotionInput,
  WithdrawStudentInput,
  StudentRosterFilters,
  PaginatedStudentRosterResponse,
} from "../types/student-assignment.types";
import { PaginationMeta } from "@/shared/types";

interface ApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly pagination?: PaginationMeta;
  readonly message?: string;
  readonly error?: string;
  readonly count?: number;
}

export class StudentAssignmentService {
  async getRoster(filters: StudentRosterFilters): Promise<PaginatedStudentRosterResponse> {
    if (!filters.academicYearId) {
      return {
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
      };
    }

    const params = new URLSearchParams();
    params.set("academicYearId", filters.academicYearId);
    if (filters.gradeId) params.set("gradeId", filters.gradeId);
    if (filters.sectionId) params.set("sectionId", filters.sectionId);
    if (filters.search) params.set("search", filters.search);
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));

    const res = await apiClient.get<ApiResponse<readonly StudentRosterItem[]>>(
      `${API_ENDPOINTS.ACADEMIC_STUDENT_ASSIGNMENTS.ROSTER}?${params.toString()}`
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

  async getGradeSectionsCapacity(
    academicYearId: string,
    gradeLevel: number
  ): Promise<readonly SectionCapacityInfo[]> {
    const params = new URLSearchParams({
      academicYearId,
      gradeLevel: String(gradeLevel),
    });

    const res = await apiClient.get<ApiResponse<readonly SectionCapacityInfo[]>>(
      `${API_ENDPOINTS.ACADEMIC_STUDENT_ASSIGNMENTS.SECTIONS_CAPACITY}?${params.toString()}`
    );

    return res.data.data || [];
  }

  async transferSingle(
    studentId: string,
    academicYearId: string,
    input: SingleTransferInput
  ): Promise<void> {
    await apiClient.post<ApiResponse<void>>(
      API_ENDPOINTS.ACADEMIC_STUDENT_ASSIGNMENTS.TRANSFER_SINGLE(studentId),
      {
        ...input,
        academicYearId,
      }
    );
  }

  async transferBulk(
    academicYearId: string,
    input: BulkTransferInput
  ): Promise<number> {
    const res = await apiClient.post<ApiResponse<void>>(
      API_ENDPOINTS.ACADEMIC_STUDENT_ASSIGNMENTS.TRANSFER_BULK,
      {
        ...input,
        academicYearId,
      }
    );

    return res.data.count || 0;
  }

  async getPromotionPreview(
    query: PromotionPreviewQuery
  ): Promise<PromotionPreviewResult> {
    const params = new URLSearchParams({
      sourceAcademicYearId: query.sourceAcademicYearId,
      targetAcademicYearId: query.targetAcademicYearId,
      gradeLevel: String(query.gradeLevel),
    });

    const res = await apiClient.get<ApiResponse<PromotionPreviewResult>>(
      `${API_ENDPOINTS.ACADEMIC_STUDENT_ASSIGNMENTS.PROMOTION_PREVIEW}?${params.toString()}`
    );

    if (!res.data.data) {
      throw new Error("Failed to load promotion preview data");
    }

    return res.data.data;
  }

  async commitPromotion(input: CommitPromotionInput): Promise<number> {
    const res = await apiClient.post<ApiResponse<void>>(
      API_ENDPOINTS.ACADEMIC_STUDENT_ASSIGNMENTS.COMMIT_PROMOTION,
      input
    );

    return res.data.count || 0;
  }

  async withdrawStudent(
    studentId: string,
    academicYearId: string,
    input: WithdrawStudentInput
  ): Promise<void> {
    await apiClient.post<ApiResponse<void>>(
      API_ENDPOINTS.ACADEMIC_STUDENT_ASSIGNMENTS.WITHDRAW(studentId),
      {
        ...input,
        academicYearId,
      }
    );
  }

  async getStudentEnrollmentHistory(
    studentId: string
  ): Promise<readonly StudentEnrollmentHistoryItem[]> {
    const res = await apiClient.get<ApiResponse<readonly StudentEnrollmentHistoryItem[]>>(
      API_ENDPOINTS.ACADEMIC_STUDENT_ASSIGNMENTS.HISTORY(studentId)
    );

    return res.data.data || [];
  }
}

export const studentAssignmentService = new StudentAssignmentService();
