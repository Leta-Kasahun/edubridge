import {
  ContentImportRepository,
  contentImportRepository,
} from "../repository/content-import.repository.js";
import {
  RawContentImportRow,
  ValidatedContentImportRow,
  ContentImportPreviewResponse,
  ContentImportCommitPayload,
  ContentImportCommitResult,
} from "../types/content-import.types.js";
import { RawContentImportRowSchema } from "../schemas/content-import.schema.js";
import { parseCsvText } from "../../../../shared/utils/import-parser.js";
import { BadRequestError } from "../../../../shared/exceptions/index.js";
import { ContentTypeEnum } from "../../../../shared/constants/index.js";

const SAMPLE_CSV =
  "title,type,description,topicCode,objectiveCode,initialText,resourceUrl\n" +
  "Structure of the Atom,LESSON,Comprehensive lesson on subatomic particles,U1T1,U1T1O1,Atoms consist of protons neutrons and electrons.,\n" +
  "Periodic Table Guide,PDF,Summary reading sheet for periodic groups,U1T2,U1T2O1,,https://example.com/periodic-table.pdf\n" +
  "Chemical Bonding Notes,NOTE,Key notes on ionic and covalent bonds,U2T1,,Chemical bonds form when valence electrons interact.,\n";

export class ContentImportService {
  constructor(
    private readonly repository: ContentImportRepository = contentImportRepository
  ) {}

  getSampleTemplate(): string {
    return SAMPLE_CSV;
  }

  async validateAndPreview(
    tenantId: string,
    csvContent: string,
    curriculumVersionId?: string
  ): Promise<ContentImportPreviewResponse> {
    const parsedCsv = parseCsvText<Record<string, string>>(csvContent);

    if (parsedCsv.rows.length === 0) {
      throw new BadRequestError("CSV file contains no data rows");
    }

    const rawRows: RawContentImportRow[] = parsedCsv.rows.map((r) => {
      const raw = r.raw;
      return {
        title: raw.title || raw.name || raw["content title"] || "",
        type: (raw.type || raw.contentType || "LESSON").toUpperCase(),
        description: raw.description || null,
        topicCode: raw.topicCode || raw.topic || raw["topic code"] || "",
        objectiveCode:
          raw.objectiveCode || raw.objective || raw["objective code"] || null,
        initialText:
          raw.initialText || raw.text || raw.body || raw["initial text"] || null,
        resourceUrl:
          raw.resourceUrl || raw.url || raw.link || raw["resource url"] || null,
      };
    });

    const uniqueTopicCodes = Array.from(
      new Set(rawRows.map((r) => r.topicCode.trim()).filter(Boolean))
    );
    const uniqueObjectiveCodes = Array.from(
      new Set(
        rawRows
          .map((r) => (r.objectiveCode ? r.objectiveCode.trim() : ""))
          .filter(Boolean)
      )
    );

    const [existingTopics, existingObjectives] = await Promise.all([
      this.repository.findTopicsByCodes(
        tenantId,
        uniqueTopicCodes,
        curriculumVersionId
      ),
      this.repository.findObjectivesByCodes(
        tenantId,
        uniqueObjectiveCodes,
        curriculumVersionId
      ),
    ]);

    const topicMap = new Map(existingTopics.map((t) => [t.code.toUpperCase(), t]));
    const objectiveMap = new Map(
      existingObjectives.map((o) => [o.code.toUpperCase(), o])
    );

    let validRowsCount = 0;
    let invalidRowsCount = 0;

    const validatedRows: ValidatedContentImportRow[] = rawRows.map(
      (raw, idx) => {
        const rowNumber = idx + 2;
        const rowErrors: string[] = [];

        const schemaValidation = RawContentImportRowSchema.safeParse(raw);
        if (!schemaValidation.success) {
          for (const issue of schemaValidation.error.issues) {
            rowErrors.push(
              `${issue.path.join(".") || "field"}: ${issue.message}`
            );
          }
        }

        const cleanTopicCode = raw.topicCode.trim().toUpperCase();
        const matchedTopic = topicMap.get(cleanTopicCode);
        if (!matchedTopic) {
          rowErrors.push(
            `Topic code '${raw.topicCode}' does not exist in curriculum`
          );
        }

        let matchedObjectiveId: string | undefined;
        if (raw.objectiveCode && raw.objectiveCode.trim()) {
          const cleanObjCode = raw.objectiveCode.trim().toUpperCase();
          const matchedObjective = objectiveMap.get(cleanObjCode);
          if (!matchedObjective) {
            rowErrors.push(
              `Objective code '${raw.objectiveCode}' does not exist in curriculum`
            );
          } else {
            matchedObjectiveId = matchedObjective.id;
          }
        }

        const isValid = rowErrors.length === 0 && Boolean(matchedTopic);

        if (isValid) {
          validRowsCount += 1;
        } else {
          invalidRowsCount += 1;
        }

        return {
          rowNumber,
          title: raw.title,
          type: (raw.type.toUpperCase() || "LESSON") as ContentTypeEnum,
          description: raw.description,
          topicCode: raw.topicCode,
          topicId: matchedTopic?.id,
          objectiveCode: raw.objectiveCode,
          objectiveId: matchedObjectiveId,
          initialText: raw.initialText,
          resourceUrl: raw.resourceUrl,
          isValid,
          errors: rowErrors,
        };
      }
    );

    return {
      totalRows: validatedRows.length,
      validRowsCount,
      invalidRowsCount,
      rows: validatedRows,
    };
  }

  async commitImport(
    tenantId: string,
    authorId: string,
    payload: ContentImportCommitPayload
  ): Promise<ContentImportCommitResult> {
    const validRows = payload.rows.filter((r) => r.isValid && r.topicId);

    if (validRows.length === 0) {
      throw new BadRequestError(
        "No valid rows provided for batch content import"
      );
    }

    const createdContentIds = await this.repository.commitImportBatch(
      tenantId,
      authorId,
      validRows
    );

    return {
      totalProcessed: payload.rows.length,
      createdCount: createdContentIds.length,
      skippedCount: payload.rows.length - createdContentIds.length,
      createdContentIds,
    };
  }
}

export const contentImportService = new ContentImportService();
