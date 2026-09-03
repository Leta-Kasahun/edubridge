import { Request, Response } from "express";
import { asyncHandler } from "../../../../shared/utils/async-handler.js";
import {
  TreeService,
  treeService,
} from "../services/tree.service.js";
import { getTenantId } from "./controller.utils.js";
import { reorderStructureSchema } from "../schemas/structure.schema.js";

export class TreeController {
  constructor(
    private readonly service: TreeService = treeService
  ) {}

  reorder = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const tenantId = getTenantId(req) || null;
      const input = reorderStructureSchema.parse(req.body);

      await this.service.reorder(tenantId, input);

      res.status(200).json({
        success: true,
        message: `${input.entityType}s reordered successfully`,
      });
    }
  );

  getStructureTree = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { versionId } = req.params;
      const tenantId = getTenantId(req) || null;

      const tree = await this.service.getStructureTree(
        tenantId,
        versionId as string
      );

      res.status(200).json({
        success: true,
        data: tree,
      });
    }
  );
}

export const treeController = new TreeController();
