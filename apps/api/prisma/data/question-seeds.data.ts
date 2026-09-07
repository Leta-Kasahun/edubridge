export interface SeedQuestion {
  readonly type: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER" | "NUMERIC";
  readonly difficulty: "EASY" | "MEDIUM" | "HARD";
  readonly points: number;
  readonly prompt: string;
  readonly explanation?: string;
  readonly options?: readonly {
    readonly text: string;
    readonly isCorrect: boolean;
    readonly orderIndex: number;
  }[];
}

export interface SeedBankDef {
  readonly name: string;
  readonly subjectCode: "MATH" | "GEN_SCI" | "ENG";
  readonly gradeLevel: 7 | 8;
  readonly style: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER" | "NUMERIC" | "MIXED";
  readonly description: string;
  readonly questions: readonly SeedQuestion[];
}

export const GRADE_8_MATH_MCQ_QUESTIONS: readonly SeedQuestion[] = [
  {
    type: "MCQ",
    difficulty: "EASY",
    points: 1,
    prompt: "Which of the following numbers is a rational number?",
    explanation: "3/4 is expressed as the quotient of two integers a/b where b != 0, making it rational.",
    options: [
      { text: "√2", isCorrect: false, orderIndex: 0 },
      { text: "π", isCorrect: false, orderIndex: 1 },
      { text: "3/4", isCorrect: true, orderIndex: 2 },
      { text: "√5", isCorrect: false, orderIndex: 3 },
    ],
  },
  {
    type: "MCQ",
    difficulty: "EASY",
    points: 1,
    prompt: "What is the square root of 144?",
    explanation: "12 * 12 = 144.",
    options: [
      { text: "11", isCorrect: false, orderIndex: 0 },
      { text: "12", isCorrect: true, orderIndex: 1 },
      { text: "14", isCorrect: false, orderIndex: 2 },
      { text: "16", isCorrect: false, orderIndex: 3 },
    ],
  },
  {
    type: "MCQ",
    difficulty: "MEDIUM",
    points: 1,
    prompt: "Solve for x in the linear equation: 3x - 7 = 14",
    explanation: "3x = 14 + 7 = 21, so x = 21 / 3 = 7.",
    options: [
      { text: "5", isCorrect: false, orderIndex: 0 },
      { text: "6", isCorrect: false, orderIndex: 1 },
      { text: "7", isCorrect: true, orderIndex: 2 },
      { text: "8", isCorrect: false, orderIndex: 3 },
    ],
  },
  {
    type: "MCQ",
    difficulty: "MEDIUM",
    points: 1,
    prompt: "If a right-angled triangle has legs of length 6 cm and 8 cm, what is the length of the hypotenuse?",
    explanation: "Using Pythagorean theorem: c = √(6^2 + 8^2) = √(36 + 64) = √100 = 10 cm.",
    options: [
      { text: "9 cm", isCorrect: false, orderIndex: 0 },
      { text: "10 cm", isCorrect: true, orderIndex: 1 },
      { text: "12 cm", isCorrect: false, orderIndex: 2 },
      { text: "14 cm", isCorrect: false, orderIndex: 3 },
    ],
  },
  {
    type: "MCQ",
    difficulty: "EASY",
    points: 1,
    prompt: "What is the value of (-3)^3?",
    explanation: "(-3) * (-3) * (-3) = 9 * (-3) = -27.",
    options: [
      { text: "-27", isCorrect: true, orderIndex: 0 },
      { text: "27", isCorrect: false, orderIndex: 1 },
      { text: "-9", isCorrect: false, orderIndex: 2 },
      { text: "9", isCorrect: false, orderIndex: 3 },
    ],
  },
  {
    type: "MCQ",
    difficulty: "MEDIUM",
    points: 1,
    prompt: "What is the slope of the line passing through points (2, 3) and (4, 7)?",
    explanation: "m = (7 - 3) / (4 - 2) = 4 / 2 = 2.",
    options: [
      { text: "1", isCorrect: false, orderIndex: 0 },
      { text: "2", isCorrect: true, orderIndex: 1 },
      { text: "3", isCorrect: false, orderIndex: 2 },
      { text: "4", isCorrect: false, orderIndex: 3 },
    ],
  },
  {
    type: "MCQ",
    difficulty: "HARD",
    points: 1,
    prompt: "What is the solution set of the inequality 2x - 5 < 7?",
    explanation: "2x < 12 => x < 6.",
    options: [
      { text: "x < 6", isCorrect: true, orderIndex: 0 },
      { text: "x > 6", isCorrect: false, orderIndex: 1 },
      { text: "x < 1", isCorrect: false, orderIndex: 2 },
      { text: "x > 1", isCorrect: false, orderIndex: 3 },
    ],
  },
  {
    type: "MCQ",
    difficulty: "EASY",
    points: 1,
    prompt: "What is the perimeter of a rectangle with length 15 cm and width 10 cm?",
    explanation: "P = 2 * (15 + 10) = 2 * 25 = 50 cm.",
    options: [
      { text: "25 cm", isCorrect: false, orderIndex: 0 },
      { text: "50 cm", isCorrect: true, orderIndex: 1 },
      { text: "75 cm", isCorrect: false, orderIndex: 2 },
      { text: "150 cm", isCorrect: false, orderIndex: 3 },
    ],
  },
  {
    type: "MCQ",
    difficulty: "MEDIUM",
    points: 1,
    prompt: "Simplify the algebraic expression: 4(2x - 3) + 5",
    explanation: "8x - 12 + 5 = 8x - 7.",
    options: [
      { text: "8x - 7", isCorrect: true, orderIndex: 0 },
      { text: "8x + 2", isCorrect: false, orderIndex: 1 },
      { text: "6x - 7", isCorrect: false, orderIndex: 2 },
      { text: "8x - 12", isCorrect: false, orderIndex: 3 },
    ],
  },
  {
    type: "MCQ",
    difficulty: "HARD",
    points: 1,
    prompt: "A circle has a radius of 7 cm. Taking π = 22/7, what is the area of the circle?",
    explanation: "Area = πr^2 = (22/7) * 7 * 7 = 22 * 7 = 154 cm^2.",
    options: [
      { text: "44 cm²", isCorrect: false, orderIndex: 0 },
      { text: "88 cm²", isCorrect: false, orderIndex: 1 },
      { text: "154 cm²", isCorrect: true, orderIndex: 2 },
      { text: "308 cm²", isCorrect: false, orderIndex: 3 },
    ],
  },
  {
    type: "MCQ",
    difficulty: "EASY",
    points: 1,
    prompt: "What is 25% of 240?",
    explanation: "240 * 0.25 = 60.",
    options: [
      { text: "40", isCorrect: false, orderIndex: 0 },
      { text: "50", isCorrect: false, orderIndex: 1 },
      { text: "60", isCorrect: true, orderIndex: 2 },
      { text: "70", isCorrect: false, orderIndex: 3 },
    ],
  },
  {
    type: "MCQ",
    difficulty: "MEDIUM",
    points: 1,
    prompt: "Find the median of the data set: 3, 7, 8, 12, 14, 18, 21",
    explanation: "The numbers are in order and the middle (4th) element is 12.",
    options: [
      { text: "8", isCorrect: false, orderIndex: 0 },
      { text: "12", isCorrect: true, orderIndex: 1 },
      { text: "14", isCorrect: false, orderIndex: 2 },
      { text: "13", isCorrect: false, orderIndex: 3 },
    ],
  },
  {
    type: "MCQ",
    difficulty: "HARD",
    points: 1,
    prompt: "If the ratio of boys to girls in a class of 45 students is 2:3, how many girls are there?",
    explanation: "Total parts = 2 + 3 = 5. Each part = 45 / 5 = 9. Girls = 3 * 9 = 27.",
    options: [
      { text: "18", isCorrect: false, orderIndex: 0 },
      { text: "21", isCorrect: false, orderIndex: 1 },
      { text: "27", isCorrect: true, orderIndex: 2 },
      { text: "30", isCorrect: false, orderIndex: 3 },
    ],
  },
  {
    type: "MCQ",
    difficulty: "EASY",
    points: 1,
    prompt: "What is the greatest common factor (GCF) of 24 and 36?",
    explanation: "Factors of 24 are 1,2,3,4,6,8,12,24. Factors of 36 are 1,2,3,4,6,9,12,18,36. The GCF is 12.",
    options: [
      { text: "4", isCorrect: false, orderIndex: 0 },
      { text: "6", isCorrect: false, orderIndex: 1 },
      { text: "12", isCorrect: true, orderIndex: 2 },
      { text: "18", isCorrect: false, orderIndex: 3 },
    ],
  },
  {
    type: "MCQ",
    difficulty: "MEDIUM",
    points: 1,
    prompt: "Which point lies on the line y = 2x + 1?",
    explanation: "For (3, 7): y = 2(3) + 1 = 7, which matches.",
    options: [
      { text: "(1, 2)", isCorrect: false, orderIndex: 0 },
      { text: "(2, 4)", isCorrect: false, orderIndex: 1 },
      { text: "(3, 7)", isCorrect: true, orderIndex: 2 },
      { text: "(4, 8)", isCorrect: false, orderIndex: 3 },
    ],
  },
  {
    type: "MCQ",
    difficulty: "EASY",
    points: 1,
    prompt: "What is the sum of angles in any triangle?",
    explanation: "The interior angles of any triangle always add up to 180 degrees.",
    options: [
      { text: "90°", isCorrect: false, orderIndex: 0 },
      { text: "180°", isCorrect: true, orderIndex: 1 },
      { text: "270°", isCorrect: false, orderIndex: 2 },
      { text: "360°", isCorrect: false, orderIndex: 3 },
    ],
  },
  {
    type: "MCQ",
    difficulty: "MEDIUM",
    points: 1,
    prompt: "What is 10^4 divided by 10^2?",
    explanation: "10^(4 - 2) = 10^2 = 100.",
    options: [
      { text: "10", isCorrect: false, orderIndex: 0 },
      { text: "100", isCorrect: true, orderIndex: 1 },
      { text: "1000", isCorrect: false, orderIndex: 2 },
      { text: "10000", isCorrect: false, orderIndex: 3 },
    ],
  },
  {
    type: "MCQ",
    difficulty: "HARD",
    points: 1,
    prompt: "Solve the system of equations: x + y = 10 and x - y = 4",
    explanation: "Adding the two gives 2x = 14 => x = 7, and y = 10 - 7 = 3.",
    options: [
      { text: "x = 7, y = 3", isCorrect: true, orderIndex: 0 },
      { text: "x = 6, y = 4", isCorrect: false, orderIndex: 1 },
      { text: "x = 8, y = 2", isCorrect: false, orderIndex: 2 },
      { text: "x = 5, y = 5", isCorrect: false, orderIndex: 3 },
    ],
  },
  {
    type: "MCQ",
    difficulty: "EASY",
    points: 1,
    prompt: "What is the reciprocal of 5/8?",
    explanation: "The reciprocal flips numerator and denominator, giving 8/5.",
    options: [
      { text: "-5/8", isCorrect: false, orderIndex: 0 },
      { text: "8/5", isCorrect: true, orderIndex: 1 },
      { text: "-8/5", isCorrect: false, orderIndex: 2 },
      { text: "5/8", isCorrect: false, orderIndex: 3 },
    ],
  },
  {
    type: "MCQ",
    difficulty: "MEDIUM",
    points: 1,
    prompt: "What is the volume of a rectangular prism with length 6 cm, width 4 cm, and height 5 cm?",
    explanation: "V = l * w * h = 6 * 4 * 5 = 120 cm^3.",
    options: [
      { text: "60 cm³", isCorrect: false, orderIndex: 0 },
      { text: "100 cm³", isCorrect: false, orderIndex: 1 },
      { text: "120 cm³", isCorrect: true, orderIndex: 2 },
      { text: "150 cm³", isCorrect: false, orderIndex: 3 },
    ],
  },
];
