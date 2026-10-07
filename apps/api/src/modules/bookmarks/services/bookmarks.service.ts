import { BookmarksRepository } from "../repository/bookmarks.repository.js";
import {
  ToggleBookmarkInput,
  ToggleBookmarkResult,
  CheckBookmarksInput,
  CheckBookmarksResult,
  ListBookmarksQuery,
  PaginatedBookmarksResponse,
} from "../types/bookmarks.types.js";
import { NotFoundError } from "../../../shared/exceptions/not-found-error.js";
import { ForbiddenError } from "../../../shared/exceptions/forbidden-error.js";

export class BookmarksService {
  constructor(
    private readonly repository: BookmarksRepository = new BookmarksRepository()
  ) {}

  private async getStudentId(
    tenantId: string,
    userId: string
  ): Promise<string> {
    const profile = await this.repository.findStudentProfileByUserId(
      tenantId,
      userId
    );
    if (!profile) {
      throw new ForbiddenError(
        "Only enrolled students can manage and view bookmarks"
      );
    }
    return profile.id;
  }

  async toggleBookmark(
    tenantId: string,
    userId: string,
    input: ToggleBookmarkInput
  ): Promise<ToggleBookmarkResult> {
    const studentId = await this.getStudentId(tenantId, userId);
    return this.repository.toggleBookmark(tenantId, studentId, input);
  }

  async checkBookmarks(
    tenantId: string,
    userId: string,
    input: CheckBookmarksInput
  ): Promise<CheckBookmarksResult> {
    const studentId = await this.getStudentId(tenantId, userId);
    return this.repository.checkBookmarks(tenantId, studentId, input);
  }

  async deleteBookmark(
    tenantId: string,
    userId: string,
    bookmarkId: string
  ): Promise<void> {
    const studentId = await this.getStudentId(tenantId, userId);
    const deleted = await this.repository.deleteBookmark(
      tenantId,
      studentId,
      bookmarkId
    );
    if (!deleted) {
      throw new NotFoundError("Bookmark not found");
    }
  }

  async listBookmarks(
    tenantId: string,
    userId: string,
    query: ListBookmarksQuery
  ): Promise<PaginatedBookmarksResponse> {
    const studentId = await this.getStudentId(tenantId, userId);
    return this.repository.listBookmarks(tenantId, studentId, query);
  }
}
