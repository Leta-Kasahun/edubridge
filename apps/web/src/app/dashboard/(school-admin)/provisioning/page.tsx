import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function ProvisioningPage() {
  redirect(ROUTES.PROVISIONING.TEACHERS);
}
