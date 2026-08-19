import { Request, Response } from "express";
import { permissionService } from "../services/permissions.service.js";
import { asyncHandler } from "../../../shared/utils/async-handler.js";

export class PermissionController {
  getAllRoles = asyncHandler(async (_req: Request, res: Response) => {
    const roles = await permissionService.getAllRoles();
    res.status(200).json({
      success: true,
      data: roles,
    });
  });

  getRoleById = asyncHandler(async (req: Request, res: Response) => {
    const role = await permissionService.getRoleById(req.params.id as string);
    res.status(200).json({
      success: true,
      data: role,
    });
  });

  createRole = asyncHandler(async (req: Request, res: Response) => {
    const role = await permissionService.createRole(req.body);
    res.status(201).json({
      success: true,
      data: role,
    });
  });

  updateRole = asyncHandler(async (req: Request, res: Response) => {
    const role = await permissionService.updateRole(req.params.id as string, req.body);
    res.status(200).json({
      success: true,
      data: role,
    });
  });

  deleteRole = asyncHandler(async (req: Request, res: Response) => {
    const result = await permissionService.deleteRole(req.params.id as string);
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  getAllPermissions = asyncHandler(async (_req: Request, res: Response) => {
    const permissions = await permissionService.getAllPermissions();
    res.status(200).json({
      success: true,
      data: permissions,
    });
  });

  createPermission = asyncHandler(async (req: Request, res: Response) => {
    const permission = await permissionService.createPermission(req.body);
    res.status(201).json({
      success: true,
      data: permission,
    });
  });

  assignPermissionToRole = asyncHandler(async (req: Request, res: Response) => {
    const roleId = req.params.id as string;
    const permissionId = (req.body.permissionId || req.params.permissionId) as string;
    const result = await permissionService.assignPermissionToRole({ roleId, permissionId });
    res.status(201).json({
      success: true,
      data: result,
    });
  });

  removePermissionFromRole = asyncHandler(async (req: Request, res: Response) => {
    const roleId = req.params.id as string;
    const permissionId = req.params.permissionId as string;
    const result = await permissionService.removePermissionFromRole(roleId, permissionId);
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  getRolePermissions = asyncHandler(async (req: Request, res: Response) => {
    const permissions = await permissionService.getRolePermissions(req.params.id as string);
    res.status(200).json({
      success: true,
      data: permissions,
    });
  });
}

export const permissionController = new PermissionController();
