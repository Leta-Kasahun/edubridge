import { Request, Response } from "express";
import { BookmarksService } from "../services/bookmarks.service.js";
import { asyncHandler } from "../../../shared/utils/async-handler.js";
import { UnauthorizedError } from "../../../shared/exceptions/unauthorized-error.js";
import {
  ToggleBookmarkDto,
  CheckBookmarksDto,
  ListBookmarksQueryDto,
} from "../schemas/bookmarks.schema.js";

export class BookmarksController {
  constructor(
    private readonly bookmarksService: BookmarksService = new BookmarksService()
  ) {}

  private getAuthContext(req: Request): { tenantId: string; userId: string } {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.userId;

    if (!tenantId || !userId) {
      throw new UnauthorizedError("Authentication context required");
    }

    return { tenantId, userId };
  }

  toggleBookmark = asyncHandler(async (req: Request, res: Response) => {
    const { tenantId, userId } = this.getAuthContext(req);
    const body = req.body as ToggleBookmarkDto;

    const result = await this.bookmarksService.toggleBookmark(
      tenantId,
      userId,
      body
    );

    res.status(200).json({
      success: true,
      data: result,
      message: result.bookmarked
        ? "Bookmark added successfully"
        : "Bookmark removed successfully",
    });
  });

  checkBookmarks = asyncHandler(async (req: Request, res: Response) => {
    const { tenantId, userId } = this.getAuthContext(req);
    const body = req.body as CheckBookmarksDto;

    const result = await this.bookmarksService.checkBookmarks(
      tenantId,
      userId,
      body
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  listBookmarks = asyncHandler(async (req: Request, res: Response) => {
    const { tenantId, userId } = this.getAuthContext(req);
    const query = req.query as unknown as ListBookmarksQueryDto;

    const result = await this.bookmarksService.listBookmarks(
      tenantId,
      userId,
      query
    );

    res.status(200).json({
      success: true,
      data: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  });

  deleteBookmark = asyncHandler(async (req: Request, res: Response) => {
    const { tenantId, userId } = this.getAuthContext(req);
    const id = String(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id || "");

    await this.bookmarksService.deleteBookmark(tenantId, userId, id);

    res.status(200).json({
      success: true,
      message: "Bookmark deleted successfully",
    });
  });
}
