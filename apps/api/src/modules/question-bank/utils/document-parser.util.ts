import {
  QuestionTypeEnum,
  DifficultyLevelEnum,
} from "../../../shared/constants/question-bank.constants.js";
import {
  QuestionUploadCandidate,
  QuestionOptionDto,
} from "../types/question-bank.types.js";
import { ExtractedDocument } from "../types/extraction.types.js";

interface ParsedAnswerKeyEntry {
  answerKey?: string;
  explanation?: string;
}

interface SectionContext {
  sectionTypeHint?: QuestionTypeEnum;
  direction?: string;
}

/**
 * Checks if a given text line represents a document metadata header,
 * examination banner, student info line, or instructions delimiter.
 */
export function isDocumentMetadataOrNoise(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 3) return true;

  const noisePatterns = [
    /^(?:ETHIOPIAN|NATIONAL|REGIONAL|GENERAL|MINISTRY|DIRECTORATE|DEPARTMENT|SCHOOL|ACADEMY|UNIVERSITY|COLLEGE)\b/i,
    /^(?:MIDTERM|FINAL|SEMESTER|TERM|ANNUAL|MODEL|SAMPLE|PRACTICE|ENTRANCE|CERTIFICATE)\s+(?:EXAM|EXAMINATION|TEST|ASSESSMENT|EVALUATION)\b/i,
    /^(?:GRADE|CLASS)\s+\d{1,2}\b/i,
    /^(?:SUBJECT|CODE|COURSE|BOOKLET|SERIES)\s*[:-]/i,
    /^(?:TIME\s+ALLOWED|DURATION|TIME)\s*[:-]/i,
    /^(?:TOTAL\s+(?:MARKS?|POINTS?|ITEMS?|QUESTIONS?))\s*[:-]/i,
    /^(?:STUDENT\s+NAME|NAME|ID\s+NO|SECTION|ROLL\s+NO|SIGNATURE)\s*[:-]/i,
    /^(?:DO\s+NOT\s+TURN|PLEASE\s+READ|ALL\s+RIGHTS\s+RESERVED|PAGE\s+\d+\s+OF\s+\d+|CONFIDENTIAL)\b/i,
    /^[=\-_*~]{4,}$/,
  ];

  return noisePatterns.some((pattern) => pattern.test(trimmed));
}

/**
 * Checks if a given text line represents a Section Header, Direction, or Instruction.
 * e.g., "PART I: MULTIPLE CHOICE", "I. Choose the correct answer", "Section A", "Direction: ..."
 */
export function isInstructionOrSectionHeader(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 3) return true;

  // 1. Part or Section headers (e.g. "PART I", "PART A", "SECTION 1", "UNIT I")
  if (/^(?:PART|SECTION|UNIT|CHAPTER)\s+(?:[0-9IVXLCDM]+|[A-Za-z])\b/i.test(trimmed)) {
    return true;
  }

  // 2. Roman Numeral or Letter Section Headings with action verbs:
  // e.g. "I. Choose the correct answer", "A. True or False", "II. Match Column A with B", "a. Fill in the blanks"
  if (
    /^(?:[IVXLCDM]+|[A-Za-z])\.\s+(?:Choose|Select|Match|Write|Read|State|Determine|Fill|Answer|Give|Complete|Identify|Classify|Explain|Solve|Calculate|Decide|Directions?|Instructions?|True\s+or\s+False|Multiple\s+Choice|Matching|Short\s+Answer)\b/i.test(
      trimmed
    )
  ) {
    return true;
  }

  // 3. Explicit Directions or Instructions lines
  // e.g. "Direction: Choose the best answer from A to D", "Instructions: Answer all questions"
  if (
    /^(?:Directions?|Instructions?|General\s+Instructions?|Specific\s+Instructions?|Note|Notice|Guideline)\s*[:-]/i.test(
      trimmed
    )
  ) {
    return true;
  }

  // 4. Standalone section type titles
  if (
    /^(?:MULTIPLE\s+CHOICE(?:\s+QUESTIONS)?|TRUE\s*(?:\/|OR|-)\s*FALSE(?:\s+ITEMS)?|MATCHING\s+ITEMS?|SHORT\s+ANSWER(?:\s+QUESTIONS)?|ESSAY\s+QUESTIONS?|FILL\s+IN\s+THE\s+BLANKS?)\s*$/i.test(
      trimmed
    )
  ) {
    return true;
  }

  return false;
}

/**
 * Detects question type hint from a section header or direction text.
 */
export function inferTypeFromInstruction(text: string): QuestionTypeEnum | undefined {
  const lower = text.toLowerCase();

  if (
    lower.includes("true or false") ||
    lower.includes("true/false") ||
    lower.includes("true - false") ||
    lower.includes("true-false") ||
    lower.includes("true / false") ||
    lower.includes("write 'true'") ||
    lower.includes('write "true"') ||
    lower.includes("state whether true")
  ) {
    return "TRUE_FALSE";
  }

  if (
    lower.includes("multiple choice") ||
    lower.includes("choose the correct") ||
    lower.includes("choose the best") ||
    lower.includes("from the given alternatives") ||
    lower.includes("choose from the choices") ||
    lower.includes("select the best")
  ) {
    return "MCQ";
  }

  if (
    lower.includes("match column") ||
    lower.includes("matching items") ||
    lower.includes("match items in column") ||
    lower.includes("match the following")
  ) {
    return "MATCHING";
  }

  if (
    lower.includes("fill in the blank") ||
    lower.includes("fill the blank") ||
    lower.includes("give short answer") ||
    lower.includes("short answer") ||
    lower.includes("briefly explain")
  ) {
    return "SHORT_ANSWER";
  }

  if (
    lower.includes("essay") ||
    lower.includes("long answer") ||
    lower.includes("discuss in detail") ||
    lower.includes("explain extensively")
  ) {
    return "LONG_ANSWER";
  }

  if (
    lower.includes("calculate the value") ||
    lower.includes("solve for") ||
    lower.includes("numeric value")
  ) {
    return "NUMERIC";
  }

  return undefined;
}

/**
 * Extracts external Answer Key & Explanation section at the bottom of the document, if present.
 * Returns a map of questionIndex -> { answerKey, explanation } and the document text with the key block removed.
 */
export function extractGlobalAnswerKeyBlock(fullText: string): {
  answerMap: Map<number, ParsedAnswerKeyEntry>;
  cleanedText: string;
} {
  const answerMap = new Map<number, ParsedAnswerKeyEntry>();
  let cleanedText = fullText;

  // Search for Answer Key / Solution section header
  const answerSectionRegex =
    /(?:^|\n)(?:ANSWER\s+KEYS?|ANSWERS?|SOLUTIONS?|KEY\s+AND\s+EXPLANATIONS?|ANSWER\s+SHEET|CORRECT\s+ANSWERS?)\s*[:-]?\s*(?:\n|$)/i;

  const match = fullText.match(answerSectionRegex);
  if (!match || match.index === undefined) {
    return { answerMap, cleanedText };
  }

  const splitIndex = match.index;
  const answerKeyBlock = fullText.substring(splitIndex);
  cleanedText = fullText.substring(0, splitIndex).trim();

  // Parse lines like "1. A", "1) B", "1 - C (Explanation: ...)", "Q1: True", "1. A. Explanation: ..."
  const entryRegex =
    /(?:^|\n|\s{2,})(?:Q\s*)?(\d{1,3})[.):\-\s]+([A-Fa-f]|True|False)\b(?:\s*[-–:]\s*|\s+(?:Explanation|Rationale|Note)\s*[:-]\s*)?([^\n\r]*)/gi;

  let entryMatch: RegExpExecArray | null;
  while ((entryMatch = entryRegex.exec(answerKeyBlock)) !== null) {
    const qNum = Number(entryMatch[1]);
    const rawKey = entryMatch[2];
    const rawExp = entryMatch[3]?.trim();

    if (qNum > 0 && rawKey) {
      answerMap.set(qNum, {
        answerKey: rawKey.toUpperCase(),
        explanation: rawExp && rawExp.length > 0 ? rawExp : undefined,
      });
    }
  }

  return { answerMap, cleanedText };
}

/**
 * Extracts options from a question chunk (e.g. A. ..., B. ..., C. ..., D. ...)
 */
export function extractOptionsFromText(
  text: string,
  detectedAnswerKey?: string
): QuestionOptionDto[] {
  const options: QuestionOptionDto[] = [];
  // Matches: A. Option, A) Option, (A) Option, a. Option, a) Option, (a) Option, [A] Option
  const optionRegex =
    /(?:^|\n|\r|\t|\s{2,})(?:\(?([A-Fa-f])[).:\-\]]|\b([A-Fa-f])[).:\-\]]\s+)([^\n\r]+?)(?=(?:\s{2,}|\n|\r|\t)(?:\(?[A-Fa-f][).:\-\]]|\b[A-Fa-f][).:\-\]])|(?:(?:Ans(?:wer)?|Key|Explanation|Note)\s*[:-]|$))/gi;

  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = optionRegex.exec(text)) !== null) {
    const rawKey = match[1] || match[2];
    const rawVal = match[3];

    if (rawKey && rawVal) {
      const key = rawKey.toUpperCase();
      let val = rawVal.trim();

      // Clean any trailing answer key indicator
      val = val
        .replace(/(?:Ans(?:wer)?|Key|Explanation|Note)\s*[:-].*$/i, "")
        .trim();

      if (val.length > 0) {
        const isCorrect = detectedAnswerKey
          ? key === detectedAnswerKey.toUpperCase()
          : index === 0;

        options.push({
          optionKey: key,
          optionText: val,
          orderIndex: index++,
          isCorrect,
        });
      }
    }
  }

  if (options.length > 0 && options[0] && !options.some((o) => o.isCorrect)) {
    options[0].isCorrect = true;
  }

  return options;
}

/**
 * Extracts inline answer key and explanation (e.g., "Answer: A", "Explanation: ...")
 */
export function extractAnswerAndExplanation(text: string): {
  answerKey?: string;
  explanation?: string;
} {
  let answerKey: string | undefined;
  let explanation: string | undefined;

  const ansMatch = text.match(
    /(?:(?:Ans(?:wer)?|Key|Correct(?:\s+Answer)?)\s*[:-]\s*)([A-Fa-f0-9]|True|False)\b/i
  );
  if (ansMatch && ansMatch[1]) {
    answerKey = ansMatch[1].toUpperCase();
  }

  const expMatch = text.match(
    /(?:(?:Answer\s+)?Explanation|Note|Rationale)\s*[:-]\s*([^\n\r]+)/i
  );
  if (expMatch && expMatch[1]) {
    explanation = expMatch[1].trim();
  }

  return { answerKey, explanation };
}

/**
 * Cleans the question stem by stripping leading question numbering,
 * option lines, and trailing answer/explanation labels.
 */
export function cleanQuestionStem(text: string): string {
  let stem = text;

  // 1. Remove leading question numbering (e.g. "1. ", "Question 1: ", "Q1. ", "1) ")
  stem = stem.replace(
    /^(?:(?:\d{1,3}[.):-]|\b(?:Question|Q)\s*\d{1,3}[.):-]))\s*/i,
    ""
  );

  // 2. Cut off at the first option match (e.g. "A) ", "A. ", "(A) ")
  const firstOptionIndex = stem.search(
    /(?:^|\n|\r|\t|\s{2,})(?:\(?[A-Fa-f][).:\-\]]|\b[A-Fa-f][).:\-\]]\s+)/i
  );

  if (firstOptionIndex !== -1) {
    stem = stem.substring(0, firstOptionIndex);
  }

  // 3. Remove trailing Answer / Explanation labels
  stem = stem
    .replace(
      /(?:(?:Ans(?:wer)?|Key|Correct(?:\s+Answer)?|Explanation|Note)\s*[:-].*)$/is,
      ""
    )
    .trim();

  return stem;
}

/**
 * Main parser entry point: parses raw extracted document into structured question candidates,
 * filtering out section headers, directions, instructions, and standalone answer key blocks.
 */
export function parseQuestionsFromDocument(
  document: ExtractedDocument
): QuestionUploadCandidate[] {
  const fullText = document.fullText || "";

  // 1. Extract external answer key table / solutions block if present
  const { answerMap, cleanedText } = extractGlobalAnswerKeyBlock(fullText);

  // 2. Split document into candidate paragraphs / chunks
  const rawParagraphs = cleanedText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const candidates: QuestionUploadCandidate[] = [];
  const currentContext: SectionContext = {};
  let sequentialQuestionNumber = 0;

  // Question numbering regex pattern: "1. ", "1) ", "Question 1:", "Q1."
  const questionNumberRegex = /^(?:(?:\d{1,3}[.):-]|\b(?:Question|Q)\s*\d{1,3}[.):-]))\s*/i;

  for (const rawParagraph of rawParagraphs) {
    // Check if this paragraph is metadata banner noise (e.g. "TIME ALLOWED: 2 HOURS", "NAME: ...")
    if (isDocumentMetadataOrNoise(rawParagraph)) {
      continue;
    }

    // Check if this paragraph is a Section Header or Direction (e.g. "PART I: TRUE/FALSE", "I. Choose the best answer")
    if (isInstructionOrSectionHeader(rawParagraph)) {
      const typeHint = inferTypeFromInstruction(rawParagraph);
      if (typeHint) {
        currentContext.sectionTypeHint = typeHint;
      }
      currentContext.direction = rawParagraph;
      // SKIP emitting this paragraph as a question!
      continue;
    }

    // Process questions inside this paragraph or across question-numbered chunks
    const hasExplicitNumbering = questionNumberRegex.test(rawParagraph);
    const subChunks = hasExplicitNumbering
      ? [rawParagraph]
      : rawParagraph
          .split(/(?:^|\n)(?=(?:(?:\d{1,3}[.):-]|\b(?:Question|Q)\s*\d{1,3}[.):-]))\s*)/gi)
          .map((s) => s.trim())
          .filter((s) => s.length > 5);

    for (const chunk of subChunks) {
      if (isInstructionOrSectionHeader(chunk) || isDocumentMetadataOrNoise(chunk)) {
        const typeHint = inferTypeFromInstruction(chunk);
        if (typeHint) currentContext.sectionTypeHint = typeHint;
        continue;
      }

      // Check question number if explicit (e.g., "1. What is...")
      const numMatch = chunk.match(/^(\d{1,3})[.):-]/);
      if (numMatch && numMatch[1]) {
        sequentialQuestionNumber = Number(numMatch[1]);
      } else {
        sequentialQuestionNumber++;
      }

      // Extract inline answers and explanations
      const { answerKey: inlineKey, explanation: inlineExp } =
        extractAnswerAndExplanation(chunk);

      // Check external answer map fallback
      const externalKeyData = answerMap.get(sequentialQuestionNumber);
      const answerKey = inlineKey || externalKeyData?.answerKey;
      const explanation = inlineExp || externalKeyData?.explanation;

      // Extract options
      const options = extractOptionsFromText(chunk, answerKey);
      const questionStem = cleanQuestionStem(chunk);

      if (!questionStem || questionStem.length < 3) continue;

      // Determine question type based on options and section context hint
      let type: QuestionTypeEnum = currentContext.sectionTypeHint || "SHORT_ANSWER";

      if (options.length >= 2) {
        const isTrueFalse =
          options.length === 2 &&
          options.some((o) => /^true$/i.test(o.optionText)) &&
          options.some((o) => /^false$/i.test(o.optionText));
        type = isTrueFalse ? "TRUE_FALSE" : "MCQ";
      } else if (currentContext.sectionTypeHint === "TRUE_FALSE") {
        type = "TRUE_FALSE";
        if (options.length === 0) {
          const isTrueCorrect = answerKey ? /^T(?:RUE)?$/i.test(answerKey) : true;
          options.push(
            { optionKey: "A", optionText: "True", orderIndex: 0, isCorrect: isTrueCorrect },
            { optionKey: "B", optionText: "False", orderIndex: 1, isCorrect: !isTrueCorrect }
          );
        }
      }

      candidates.push({
        questionText: questionStem,
        type,
        difficulty: "MEDIUM" as DifficultyLevelEnum,
        points: 1,
        explanation: explanation || undefined,
        options: options.length > 0 ? options : undefined,
      });
    }
  }

  return candidates;
}
