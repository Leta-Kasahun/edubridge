import { Router } from "express";
import { BookmarksController } from "./controllers/bookmarks.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { requireRoles } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import {
  toggleBookmarkSchema,
  checkBookmarksSchema,
  listBookmarksQuerySchema,
  bookmarkIdParamSchema,
} from "./schemas/bookmarks.schema.js";

const router: Router = Router();
const controller = new BookmarksController();

router.use(authenticate);
router.use(requireRoles("STUDENT"));

router.post(
  "/toggle",
  validate(toggleBookmarkSchema),
  controller.toggleBookmark
);

router.post(
  "/check",
  validate(checkBookmarksSchema),
  controller.checkBookmarks
);

router.get(
  "/",
  validate({ query: listBookmarksQuerySchema }),
  controller.listBookmarks
);

router.delete(
  "/:id",
  validate({ params: bookmarkIdParamSchema }),
  controller.deleteBookmark
);

export { router as bookmarksRouter };
