import {
  CurriculumImportRepository,
  curriculumImportRepository,
  ImportTransactionPayloadItem,
} from "../repository/curriculum-import.repository.js";
import {
  RawCurriculumImportRow,
  ValidatedCurriculumImportRow,
  CurriculumImportIssue,
  CurriculumImportPreview,
  CurriculumImportCommitPayload,
  CurriculumImportCommitResult,
} from "../types/curriculum-import.types.js";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "../../../../shared/exceptions/index.js";
import { parseCsvText } from "../../../../shared/utils/import-parser.js";
import {
  generateUnitCode,
  generateTopicCode,
  generateObjectiveCode,
} from "../../../../shared/utils/generators.js";

export class CurriculumImportService {
  constructor(
    private readonly repo: CurriculumImportRepository = curriculumImportRepository
  ) {}

  private extractRawRows(payload: CurriculumImportCommitPayload): RawCurriculumImportRow[] {
    if (payload.rows && payload.rows.length > 0) {
      return payload.rows as RawCurriculumImportRow[];
    }

    if (payload.csvContent && payload.csvContent.trim()) {
      const parsed = parseCsvText<Record<string, string>>(payload.csvContent);
      return parsed.rows.map((r) => {
        const raw = r.raw;
        return {
          gradeLevel: raw.gradeLevel || raw.grade || raw["grade level"] || "",
          subjectName: raw.subjectName || raw.subject || raw.subjectCode || "",
          unitTitle: raw.unitTitle || raw.unit || raw["unit title"] || "",
          unitCode: raw.unitCode || raw["unit code"] || null,
          unitDescription: raw.unitDescription || raw["unit description"] || null,
          topicTitle: raw.topicTitle || raw.topic || raw["topic title"] || "",
          topicCode: raw.topicCode || raw["topic code"] || null,
          topicDescription: raw.topicDescription || raw["topic description"] || null,
          objectiveStatement:
            raw.objectiveStatement ||
            raw.objective ||
            raw.learningObjective ||
            raw["objective statement"] ||
            "",
          objectiveCode: raw.objectiveCode || raw["objective code"] || null,
          objectiveDescription:
            raw.objectiveDescription || raw["objective description"] || null,
          externalId: raw.externalId || raw["external id"] || null,
        };
      });
    }

    return [];
  }

  private parseGradeLevelNumber(val: number | string): number | null {
    if (typeof val === "number") return val;
    const digits = String(val).replace(/\D/g, "");
    if (!digits) return null;
    const num = Number.parseInt(digits, 10);
    return Number.isNaN(num) ? null : num;
  }

  async previewImport(
    tenantId: string | null,
    payload: CurriculumImportCommitPayload
  ): Promise<CurriculumImportPreview> {
    const rawRows = this.extractRawRows(payload);
    if (rawRows.length === 0) {
      throw new BadRequestError("No rows found in the import file");
    }

    const context = await this.repo.loadStructureContext(
      tenantId,
      payload.curriculumVersionId
    );
    if (!context) {
      throw new NotFoundError("Curriculum version not found");
    }

    const { version, grades, subjects, existingSubjects } = context;

    if (version.curriculum.scope === "TENANT") {
      if (!tenantId || version.curriculum.tenantId !== tenantId) {
        throw new ForbiddenError("Access to this curriculum version is denied");
      }
    }

    if (version.status === "ARCHIVED" || version.curriculum.status === "ARCHIVED") {
      throw new BadRequestError("Archived curriculum versions cannot be modified");
    }

    const gradeMap = new Map<number, string>();
    for (const g of grades) {
      gradeMap.set(g.level, g.id);
    }

    const subjectMap = new Map<string, { id: string; name: string; code: string }>();
    for (const s of subjects) {
      subjectMap.set(s.name.trim().toLowerCase(), { id: s.id, name: s.name, code: s.code });
      subjectMap.set(s.code.trim().toLowerCase(), { id: s.id, name: s.name, code: s.code });
    }

    const virtualSubjects = new Map<string, {
      id: string;
      units: Map<string, {
        id?: string;
        code: string;
        orderIndex: number;
        topics: Map<string, {
          id?: string;
          code: string;
          orderIndex: number;
          objectives: Set<string>;
          objectiveCount: number;
        }>;
        topicCount: number;
      }>;
      unitCount: number;
    }>();

    for (const sub of existingSubjects) {
      const subKey = `${sub.gradeId}_${sub.subjectId}`;
      const unitsMap = new Map();

      for (const u of sub.units) {
        const topicsMap = new Map();
        for (const t of u.topics) {
          const objSet = new Set(
            t.objectives.map((o) => o.statement.trim().toLowerCase())
          );
          topicsMap.set(t.title.trim().toLowerCase(), {
            id: t.id,
            code: t.code,
            orderIndex: t.orderIndex,
            objectives: objSet,
            objectiveCount: t.objectives.length,
          });
        }

        unitsMap.set(u.title.trim().toLowerCase(), {
          id: u.id,
          code: u.code,
          orderIndex: u.orderIndex,
          topics: topicsMap,
          topicCount: u.topics.length,
        });
      }

      virtualSubjects.set(subKey, {
        id: sub.id,
        units: unitsMap,
        unitCount: sub.units.length,
      });
    }

    const validatedRows: ValidatedCurriculumImportRow[] = [];
    const issues: CurriculumImportIssue[] = [];
    let validCount = 0;
    let invalidCount = 0;

    const uniqueSubjectKeys = new Set<string>();
    const uniqueUnitKeys = new Set<string>();
    const uniqueTopicKeys = new Set<string>();
    const uniqueObjectiveKeys = new Set<string>();

    for (let index = 0; index < rawRows.length; index += 1) {
      const row = rawRows[index];
      if (!row) continue;

      const rowNumber = index + 1;
      const rowErrors: string[] = [];
      const rowWarnings: string[] = [];

      const parsedGradeLevel = this.parseGradeLevelNumber(row.gradeLevel);
      let resolvedGradeId: string | null = null;
      if (!parsedGradeLevel) {
        rowErrors.push("Grade level is missing or invalid");
        issues.push({
          rowNumber,
          field: "gradeLevel",
          message: "Grade level is required (e.g. 9 or Grade 9)",
          severity: "ERROR",
        });
      } else {
        resolvedGradeId = gradeMap.get(parsedGradeLevel) || null;
        if (!resolvedGradeId) {
          rowErrors.push(`Grade ${parsedGradeLevel} is not configured in this school`);
          issues.push({
            rowNumber,
            field: "gradeLevel",
            message: `Grade ${parsedGradeLevel} does not exist in academic grades`,
            severity: "ERROR",
          });
        }
      }

      const rawSub = (row.subjectName || "").trim();
      let resolvedSubjectId: string | null = null;
      let resolvedSubjectName = rawSub;
      let resolvedSubjectCode: string | null = null;

      if (!rawSub) {
        rowErrors.push("Subject name is required");
        issues.push({
          rowNumber,
          field: "subjectName",
          message: "Subject name or code is required",
          severity: "ERROR",
        });
      } else {
        const subMatch = subjectMap.get(rawSub.toLowerCase());
        if (!subMatch) {
          rowErrors.push(`Subject '${rawSub}' is not configured in academic subjects`);
          issues.push({
            rowNumber,
            field: "subjectName",
            message: `Subject '${rawSub}' was not found in school subjects`,
            severity: "ERROR",
          });
        } else {
          resolvedSubjectId = subMatch.id;
          resolvedSubjectName = subMatch.name;
          resolvedSubjectCode = subMatch.code;
        }
      }

      const rawUnit = (row.unitTitle || "").trim();
      if (!rawUnit) {
        rowErrors.push("Unit title is required");
        issues.push({
          rowNumber,
          field: "unitTitle",
          message: "Unit title cannot be empty",
          severity: "ERROR",
        });
      }

      const rawTopic = (row.topicTitle || "").trim();
      if (!rawTopic) {
        rowErrors.push("Topic title is required");
        issues.push({
          rowNumber,
          field: "topicTitle",
          message: "Topic title cannot be empty",
          severity: "ERROR",
        });
      }

      const rawObj = (row.objectiveStatement || "").trim();
      if (!rawObj) {
        rowErrors.push("Objective statement is required");
        issues.push({
          rowNumber,
          field: "objectiveStatement",
          message: "Learning objective statement cannot be empty",
          severity: "ERROR",
        });
      }

      let isUnitNew = false;
      let isTopicNew = false;
      let isObjectiveNew = false;
      let calculatedUnitCode = row.unitCode?.trim() || "";
      let calculatedTopicCode = row.topicCode?.trim() || "";
      let calculatedObjectiveCode = row.objectiveCode?.trim() || "";

      if (resolvedGradeId && resolvedSubjectId && rawUnit && rawTopic && rawObj) {
        const subKey = `${resolvedGradeId}_${resolvedSubjectId}`;
        uniqueSubjectKeys.add(subKey);

        let subjectEntry = virtualSubjects.get(subKey);
        if (!subjectEntry) {
          subjectEntry = {
            id: `virt_${subKey}`,
            units: new Map(),
            unitCount: 0,
          };
          virtualSubjects.set(subKey, subjectEntry);
        }

        const unitKey = rawUnit.toLowerCase();
        let unitEntry = subjectEntry.units.get(unitKey);
        if (!unitEntry) {
          isUnitNew = true;
          const unitOrder = subjectEntry.unitCount + 1;
          calculatedUnitCode = calculatedUnitCode || generateUnitCode(unitOrder);
          unitEntry = {
            code: calculatedUnitCode,
            orderIndex: unitOrder,
            topics: new Map(),
            topicCount: 0,
          };
          subjectEntry.unitCount += 1;
          subjectEntry.units.set(unitKey, unitEntry);
        } else {
          calculatedUnitCode = unitEntry.code;
        }

        const globalUnitKey = `${subKey}::${unitKey}`;
        uniqueUnitKeys.add(globalUnitKey);

        const topicKey = rawTopic.toLowerCase();
        let topicEntry = unitEntry.topics.get(topicKey);
        if (!topicEntry) {
          isTopicNew = true;
          const topicOrder = unitEntry.topicCount + 1;
          calculatedTopicCode =
            calculatedTopicCode ||
            generateTopicCode(unitEntry.code, topicOrder);
          topicEntry = {
            code: calculatedTopicCode,
            orderIndex: topicOrder,
            objectives: new Set(),
            objectiveCount: 0,
          };
          unitEntry.topicCount += 1;
          unitEntry.topics.set(topicKey, topicEntry);
        } else {
          calculatedTopicCode = topicEntry.code;
        }

        const globalTopicKey = `${globalUnitKey}::${topicKey}`;
        uniqueTopicKeys.add(globalTopicKey);

        const objKey = rawObj.toLowerCase();
        if (topicEntry.objectives.has(objKey)) {
          rowWarnings.push("Duplicate objective within topic (will be skipped on commit)");
          issues.push({
            rowNumber,
            field: "objectiveStatement",
            message: "Duplicate objective statement under this topic",
            severity: "WARNING",
          });
        } else {
          isObjectiveNew = true;
          const objOrder = topicEntry.objectiveCount + 1;
          calculatedObjectiveCode =
            calculatedObjectiveCode ||
            generateObjectiveCode(topicEntry.code, objOrder);
          topicEntry.objectiveCount += 1;
          topicEntry.objectives.add(objKey);
        }

        const globalObjKey = `${globalTopicKey}::${objKey}`;
        uniqueObjectiveKeys.add(globalObjKey);
      }

      const isValid = rowErrors.length === 0;
      if (isValid) {
        validCount += 1;
      } else {
        invalidCount += 1;
      }

      validatedRows.push({
        rowNumber,
        gradeLevel: parsedGradeLevel || 0,
        gradeId: resolvedGradeId,
        subjectName: resolvedSubjectName,
        subjectId: resolvedSubjectId,
        subjectCode: resolvedSubjectCode,
        unitTitle: rawUnit,
        unitCode: calculatedUnitCode,
        unitDescription: row.unitDescription?.trim() || null,
        topicTitle: rawTopic,
        topicCode: calculatedTopicCode,
        topicDescription: row.topicDescription?.trim() || null,
        objectiveStatement: rawObj,
        objectiveCode: calculatedObjectiveCode,
        objectiveDescription: row.objectiveDescription?.trim() || null,
        externalId: row.externalId?.trim() || null,
        isValid,
        isUnitNew,
        isTopicNew,
        isObjectiveNew,
        errors: rowErrors,
        warnings: rowWarnings,
      });
    }

    return {
      curriculumVersionId: version.id,
      versionCode: version.code,
      versionName: version.name,
      totalRows: validatedRows.length,
      validRowsCount: validCount,
      invalidRowsCount: invalidCount,
      uniqueSubjectsCount: uniqueSubjectKeys.size,
      uniqueUnitsCount: uniqueUnitKeys.size,
      uniqueTopicsCount: uniqueTopicKeys.size,
      uniqueObjectivesCount: uniqueObjectiveKeys.size,
      rows: validatedRows,
      issues,
      canCommit: invalidCount === 0 && validCount > 0,
    };
  }

  async commitImport(
    tenantId: string | null,
    userId: string,
    payload: CurriculumImportCommitPayload
  ): Promise<CurriculumImportCommitResult> {
    const preview = await this.previewImport(tenantId, payload);
    if (!preview.canCommit || preview.invalidRowsCount > 0) {
      throw new BadRequestError(
        `Cannot commit import: found ${preview.invalidRowsCount} invalid row(s)`
      );
    }

    const validRows = preview.rows.filter((r) => r.isValid && r.gradeId && r.subjectId);

    const transactionItems: ImportTransactionPayloadItem[] = validRows.map((r) => ({
      gradeId: r.gradeId as string,
      subjectId: r.subjectId as string,
      unitTitle: r.unitTitle,
      unitCode: r.unitCode,
      unitDescription: r.unitDescription,
      topicTitle: r.topicTitle,
      topicCode: r.topicCode,
      topicDescription: r.topicDescription,
      objectiveStatement: r.objectiveStatement,
      objectiveCode: r.objectiveCode,
      objectiveDescription: r.objectiveDescription,
      externalId: r.externalId,
    }));

    const result = await this.repo.executeImportTransaction(
      payload.curriculumVersionId,
      transactionItems
    );

    return {
      curriculumVersionId: payload.curriculumVersionId,
      totalProcessedRows: validRows.length,
      createdSubjectsCount: result.createdSubjects,
      createdUnitsCount: result.createdUnits,
      createdTopicsCount: result.createdTopics,
      createdObjectivesCount: result.createdObjectives,
      skippedDuplicatesCount: result.skippedDuplicates,
      committedAt: new Date(),
    };
  }

  getSampleCsvTemplate(): string {
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
