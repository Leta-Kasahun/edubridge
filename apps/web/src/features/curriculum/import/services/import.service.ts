import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import * as XLSX from "xlsx";
import {
  CurriculumImportPreview,
  CurriculumImportCommitPayload,
  CurriculumImportCommitResult,
} from "../types/import.types";

export interface ApiResponse<T> {
  readonly success: boolean;
  readonly message?: string;
  readonly data: T;
}

export class CurriculumImportService {
  async previewImport(
    payload: CurriculumImportCommitPayload
  ): Promise<CurriculumImportPreview> {
    const response = await apiClient.post<ApiResponse<CurriculumImportPreview>>(
      API_ENDPOINTS.CURRICULUM_IMPORT.PREVIEW,
      payload
    );
    return response.data.data;
  }

  async commitImport(
    payload: CurriculumImportCommitPayload
  ): Promise<CurriculumImportCommitResult> {
    const response = await apiClient.post<ApiResponse<CurriculumImportCommitResult>>(
      API_ENDPOINTS.CURRICULUM_IMPORT.COMMIT,
      payload
    );
    return response.data.data;
  }

  async downloadCsvTemplate(): Promise<void> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api${API_ENDPOINTS.CURRICULUM_IMPORT.TEMPLATE}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );

      let text = "";
      if (response.ok) {
        text = await response.text();
      } else {
        text = this.getFallbackCsvTemplate();
      }

      const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "curriculum_structure_template.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      const fallback = this.getFallbackCsvTemplate();
      const blob = new Blob([fallback], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "curriculum_structure_template.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  async downloadExcelTemplate(): Promise<void> {
    const rows = [
      [
        "gradeLevel",
        "subjectName",
        "unitTitle",
        "topicTitle",
        "objectiveStatement",
        "unitDescription",
        "topicDescription",
        "objectiveDescription",
      ],
      [
        9,
        "Mathematics",
        "Number Systems",
        "Rational and Irrational Numbers",
        "Identify and classify rational and irrational numbers on the real line",
        "Real numbers and foundational number concepts",
        "Number classification and decimal representation",
        "Core learning objective",
      ],
      [
        9,
        "Mathematics",
        "Number Systems",
        "Rational and Irrational Numbers",
        "Perform arithmetic operations with radicals and simplify expressions",
        "Real numbers and foundational number concepts",
        "Properties and operations of radicals",
        "Core learning objective",
      ],
      [
        9,
        "Mathematics",
        "Equations and Inequalities",
        "Linear Equations in One Variable",
        "Solve single-variable linear equations and verify solutions",
        "Algebraic foundations and linear relationships",
        "Techniques and applications of linear equations",
        "Core learning objective",
      ],
      [
        10,
        "Physics",
        "Motion in One Dimension",
        "Kinematics and Velocity",
        "Calculate average and instantaneous velocity from motion graphs",
        "Foundations of one-dimensional kinematics",
        "Velocity and position-time relationships",
        "Core learning objective",
      ],
      [
        10,
        "Physics",
        "Motion in One Dimension",
        "Uniform Acceleration",
        "Apply kinematic equations to solve constant acceleration problems",
        "Foundations of one-dimensional kinematics",
        "Equations of uniformly accelerated motion",
        "Core learning objective",
      ],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Curriculum Structure");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "curriculum_structure_template.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private getFallbackCsvTemplate(): string {
    return (
      "gradeLevel,subjectName,unitTitle,topicTitle,objectiveStatement,unitDescription,topicDescription,objectiveDescription\n" +
      "9,Mathematics,Number Systems,Rational and Irrational Numbers,Identify and classify rational and irrational numbers on the real line,Real numbers and foundational number concepts,Number classification and decimal representation,Core learning objective\n" +
      "9,Mathematics,Number Systems,Rational and Irrational Numbers,Perform arithmetic operations with radicals and simplify expressions,Real numbers and foundational number concepts,Properties and operations of radicals,Core learning objective\n" +
      "9,Mathematics,Equations and Inequalities,Linear Equations in One Variable,Solve single-variable linear equations and verify solutions,Algebraic foundations and linear relationships,Techniques and applications of linear equations,Core learning objective\n" +
      "10,Physics,Motion in One Dimension,Kinematics and Velocity,Calculate average and instantaneous velocity from motion graphs,Foundations of one-dimensional kinematics,Velocity and position-time relationships,Core learning objective\n" +
      "10,Physics,Motion in One Dimension,Uniform Acceleration,Apply kinematic equations to solve constant acceleration problems,Foundations of one-dimensional kinematics,Equations of uniformly accelerated motion,Core learning objective\n"
    );
  }
}

export const curriculumImportService = new CurriculumImportService();
