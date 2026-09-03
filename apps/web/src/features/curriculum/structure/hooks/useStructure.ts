import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { structureService } from "../services/structure.service";
import {
  CreateCurriculumSubjectPayload,
  CreateUnitPayload,
  UpdateUnitPayload,
  CreateTopicPayload,
  UpdateTopicPayload,
  CreateObjectivePayload,
  UpdateObjectivePayload,
  ReorderStructurePayload,
} from "../types/structure.types";

export const STRUCTURE_KEYS = {
  all: ["curriculum-structure"] as const,
  subjects: (versionId: string) => [...STRUCTURE_KEYS.all, "subjects", versionId] as const,
  units: (subjectId: string) => [...STRUCTURE_KEYS.all, "units", subjectId] as const,
  topics: (unitId: string) => [...STRUCTURE_KEYS.all, "topics", unitId] as const,
  objectives: (topicId: string) => [...STRUCTURE_KEYS.all, "objectives", topicId] as const,
  tree: (versionId: string) => [...STRUCTURE_KEYS.all, "tree", versionId] as const,
};

export function useCurriculumSubjects(versionId: string) {
  return useQuery({
    queryKey: STRUCTURE_KEYS.subjects(versionId),
    queryFn: () => structureService.getSubjects(versionId),
    enabled: Boolean(versionId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCurriculumUnits(subjectId: string, enabled = true) {
  return useQuery({
    queryKey: STRUCTURE_KEYS.units(subjectId),
    queryFn: () => structureService.getUnits(subjectId),
    enabled: Boolean(subjectId) && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCurriculumTopics(unitId: string, enabled = false) {
  return useQuery({
    queryKey: STRUCTURE_KEYS.topics(unitId),
    queryFn: () => structureService.getTopics(unitId),
    enabled: Boolean(unitId) && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLearningObjectives(topicId: string, enabled = false) {
  return useQuery({
    queryKey: STRUCTURE_KEYS.objectives(topicId),
    queryFn: () => structureService.getObjectives(topicId),
    enabled: Boolean(topicId) && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCurriculumSubjectPayload) =>
      structureService.createSubject(payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: STRUCTURE_KEYS.subjects(vars.curriculumVersionId),
      });
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      subjectId,
    }: {
      subjectId: string;
      versionId: string;
    }) => structureService.deleteSubject(subjectId),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: STRUCTURE_KEYS.subjects(vars.versionId),
      });
    },
  });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUnitPayload) =>
      structureService.createUnit(payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: STRUCTURE_KEYS.units(vars.curriculumSubjectId),
      });
    },
  });
}

export function useUpdateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      unitId,
      payload,
    }: {
      unitId: string;
      subjectId: string;
      payload: UpdateUnitPayload;
    }) => structureService.updateUnit(unitId, payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: STRUCTURE_KEYS.units(vars.subjectId),
      });
    },
  });
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      unitId,
    }: {
      unitId: string;
      subjectId: string;
    }) => structureService.deleteUnit(unitId),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: STRUCTURE_KEYS.units(vars.subjectId),
      });
    },
  });
}

export function useCreateTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTopicPayload) =>
      structureService.createTopic(payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: STRUCTURE_KEYS.topics(vars.unitId),
      });
      queryClient.invalidateQueries({
        queryKey: STRUCTURE_KEYS.all,
      });
    },
  });
}

export function useUpdateTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      topicId,
      payload,
    }: {
      topicId: string;
      unitId: string;
      payload: UpdateTopicPayload;
    }) => structureService.updateTopic(topicId, payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: STRUCTURE_KEYS.topics(vars.unitId),
      });
    },
  });
}

export function useDeleteTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      topicId,
    }: {
      topicId: string;
      unitId: string;
    }) => structureService.deleteTopic(topicId),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: STRUCTURE_KEYS.topics(vars.unitId),
      });
      queryClient.invalidateQueries({
        queryKey: STRUCTURE_KEYS.all,
      });
    },
  });
}

export function useCreateObjective() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateObjectivePayload) =>
      structureService.createObjective(payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: STRUCTURE_KEYS.objectives(vars.topicId),
      });
      queryClient.invalidateQueries({
        queryKey: STRUCTURE_KEYS.all,
      });
    },
  });
}

export function useUpdateObjective() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      objectiveId,
      payload,
    }: {
      objectiveId: string;
      topicId: string;
      payload: UpdateObjectivePayload;
    }) => structureService.updateObjective(objectiveId, payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: STRUCTURE_KEYS.objectives(vars.topicId),
      });
    },
  });
}

export function useDeleteObjective() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      objectiveId,
    }: {
      objectiveId: string;
      topicId: string;
    }) => structureService.deleteObjective(objectiveId),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: STRUCTURE_KEYS.objectives(vars.topicId),
      });
      queryClient.invalidateQueries({
        queryKey: STRUCTURE_KEYS.all,
      });
    },
  });
}

export function useReorderStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReorderStructurePayload) =>
      structureService.reorder(payload),
    onSuccess: (_, vars) => {
      if (vars.entityType === "unit") {
        queryClient.invalidateQueries({
          queryKey: STRUCTURE_KEYS.units(vars.parentId),
        });
      } else if (vars.entityType === "topic") {
        queryClient.invalidateQueries({
          queryKey: STRUCTURE_KEYS.topics(vars.parentId),
        });
      } else if (vars.entityType === "objective") {
        queryClient.invalidateQueries({
          queryKey: STRUCTURE_KEYS.objectives(vars.parentId),
        });
      }
    },
  });
}
