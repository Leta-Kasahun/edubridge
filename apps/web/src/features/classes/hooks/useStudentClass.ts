import { useQuery } from "@tanstack/react-query";
import { studentClassService } from "../services/student-class.service";
import { StudentMyClassData } from "../types";

export const studentClassKeys = {
  all: ["student-class"] as const,
  myClass: () => [...studentClassKeys.all, "my-class"] as const,
};

export const useStudentClass = () => {
  return useQuery<StudentMyClassData, Error>({
    queryKey: studentClassKeys.myClass(),
    queryFn: () => studentClassService.getMyClass(),
    staleTime: 5 * 60 * 1000,
  });
};
