"use client";

import { useState } from "react";
import { TenantProvisioningForm } from "./TenantProvisioningForm";
import { ProvisioningResultCard } from "./ProvisioningResultCard";
import { ProvisionSchoolAdminResult } from "../types/tenant-provisioning.types";

export function TenantProvisioningManager() {
  const [result, setResult] = useState<ProvisionSchoolAdminResult | null>(null);

  if (result) {
    return (
      <ProvisioningResultCard
        result={result}
        onReset={() => setResult(null)}
      />
    );
  }

  return <TenantProvisioningForm onSuccess={setResult} />;
}
