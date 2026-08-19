import { Request, Response } from "express";
import { lookupService } from "../services/lookup.service.js";
import { asyncHandler } from "../../../shared/utils/async-handler.js";

export class LookupController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const data = await lookupService.getAllByCategory(req.params.category as string);
    res.status(200).json({ success: true, data });
  });

  getByKey = asyncHandler(async (req: Request, res: Response) => {
    const data = await lookupService.getByCategoryAndKey(
      req.params.category as string,
      req.params.key as string
    );
    res.status(200).json({ success: true, data });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = await lookupService.createLookup(req.body);
    res.status(201).json({ success: true, data });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const data = await lookupService.updateLookup(req.params.id as string, req.body);
    res.status(200).json({ success: true, data });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await lookupService.deleteLookup(req.params.id as string);
    res.status(204).send();
  });
}

export const lookupController = new LookupController();
