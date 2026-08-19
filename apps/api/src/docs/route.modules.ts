import { registerPermissionDocs } from "../modules/permissions/permissions.doc.js";
import { registerLookupDocs } from "../modules/lookup/lookup.doc.js";
import { registerAuthDocs } from "../modules/auth/auth.doc.js";

export function registerAllModules(): void {
  registerAuthDocs();
  registerPermissionDocs();
  registerLookupDocs();
}
