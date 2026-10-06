import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function PracticePage() {
  redirect(ROUTES.STUDENT.EXAMS);
}

