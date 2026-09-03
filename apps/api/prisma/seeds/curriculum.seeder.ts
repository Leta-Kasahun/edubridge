import { prisma, runWithoutTenant } from "../../src/lib/prisma.js";

interface ObjectiveSeedData {
  readonly code: string;
  readonly statement: string;
  readonly description?: string;
  readonly orderIndex: number;
}

interface TopicSeedData {
  readonly code: string;
  readonly title: string;
  readonly description?: string;
  readonly orderIndex: number;
  readonly objectives: readonly ObjectiveSeedData[];
}

interface UnitSeedData {
  readonly code: string;
  readonly title: string;
  readonly description?: string;
  readonly orderIndex: number;
  readonly topics: readonly TopicSeedData[];
}

interface SubjectStructureSeedData {
  readonly subjectCode: string;
  readonly gradeLevel: number;
  readonly units: readonly UnitSeedData[];
}

interface CurriculumVersionSeedData {
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  readonly subjects: readonly SubjectStructureSeedData[];
}

interface CurriculumSeedData {
  readonly name: string;
  readonly code: string;
  readonly description: string;
  readonly authorityName: string;
  readonly versions: readonly CurriculumVersionSeedData[];
}

const ETHIOPIAN_CURRICULUM_SEEDS: readonly CurriculumSeedData[] = [
  {
    name: "Ethiopian General Secondary Curriculum",
    code: "SEC181",
    description: "National General Secondary Education Curriculum Framework for Grades 9-10 based on the 2018 E.C. standards.",
    authorityName: "Ministry of Education",
    versions: [
      {
        code: "V1",
        name: "Version 1 (2018)",
        description: "Official competency-based curriculum framework for Grades 9 and 10 secondary schools.",
        status: "ACTIVE",
        subjects: [
          {
            subjectCode: "MATH",
            gradeLevel: 9,
            units: [
              {
                code: "U1",
                title: "Further on Sets",
                description: "Set theory foundations, operations, and Venn diagram applications.",
                orderIndex: 1,
                topics: [
                  {
                    code: "U1T1",
                    title: "Set Operations and Venn Diagrams",
                    description: "Set union, intersection, difference, and complement operations.",
                    orderIndex: 1,
                    objectives: [
                      {
                        code: "U1T1O1",
                        statement: "Perform union, intersection, difference, and complement operations on sets",
                        description: "Understand fundamental set relations and operations.",
                        orderIndex: 1,
                      },
                      {
                        code: "U1T1O2",
                        statement: "Apply Venn diagrams to solve real-world survey and counting problems",
                        description: "Use Venn diagrams to represent relationships between two and three sets.",
                        orderIndex: 2,
                      },
                    ],
                  },
                  {
                    code: "U1T2",
                    title: "Subsets and Power Sets",
                    description: "Proper subsets, power set cardinality, and element membership.",
                    orderIndex: 2,
                    objectives: [
                      {
                        code: "U1T2O1",
                        statement: "Determine all subsets and the power set of a finite set",
                        description: "Calculate the cardinality of power sets 2^n.",
                        orderIndex: 1,
                      },
                    ],
                  },
                ],
              },
              {
                code: "U2",
                title: "The Number System",
                description: "Classification of real numbers, radicals, and scientific notation.",
                orderIndex: 2,
                topics: [
                  {
                    code: "U2T1",
                    title: "Rational and Irrational Numbers",
                    description: "Decimal representations and real line density.",
                    orderIndex: 1,
                    objectives: [
                      {
                        code: "U2T1O1",
                        statement: "Differentiate between rational and irrational numbers on the real line",
                        description: "Identify terminating and repeating decimals as rational numbers.",
                        orderIndex: 1,
                      },
                      {
                        code: "U2T1O2",
                        statement: "Perform operations with radicals and simplify radical expressions",
                        description: "Simplify radicals by factoring and rationalizing denominators.",
                        orderIndex: 2,
                      },
                    ],
                  },
                  {
                    code: "U2T2",
                    title: "Significant Figures and Scientific Notation",
                    description: "Measurement precision and floating-point scientific representations.",
                    orderIndex: 2,
                    objectives: [
                      {
                        code: "U2T2O1",
                        statement: "Express numbers in standard scientific notation with correct significant figures",
                        description: "Apply significant figure rules in arithmetic operations.",
                        orderIndex: 1,
                      },
                    ],
                  },
                ],
              },
              {
                code: "U3",
                title: "Solving Equations and Inequalities",
                description: "Single-variable linear equations, inequalities, and absolute value models.",
                orderIndex: 3,
                topics: [
                  {
                    code: "U3T1",
                    title: "Linear Equations in One Variable",
                    description: "Solution strategies and modeling linear situations.",
                    orderIndex: 1,
                    objectives: [
                      {
                        code: "U3T1O1",
                        statement: "Solve single-variable linear equations using algebraic transformations",
                        description: "Apply the addition and multiplication properties of equality.",
                        orderIndex: 1,
                      },
                      {
                        code: "U3T1O2",
                        statement: "Formulate and solve real-world problems using linear equations",
                        description: "Translate verbal statements into mathematical equations.",
                        orderIndex: 2,
                      },
                    ],
                  },
                  {
                    code: "U3T2",
                    title: "Linear Inequalities in One Variable",
                    description: "Inequality solution sets and interval notation.",
                    orderIndex: 2,
                    objectives: [
                      {
                        code: "U3T2O1",
                        statement: "Solve linear inequalities and graph solution sets on a number line",
                        description: "Express solution sets using set-builder and interval notations.",
                        orderIndex: 1,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            subjectCode: "PHYS",
            gradeLevel: 9,
            units: [
              {
                code: "U1",
                title: "Physics and Human Society",
                description: "Introduction to physics branches and their societal contributions.",
                orderIndex: 1,
                topics: [
                  {
                    code: "U1T1",
                    title: "Branches of Physics and Technology",
                    description: "Interdisciplinary connections of physics.",
                    orderIndex: 1,
                    objectives: [
                      {
                        code: "U1T1O1",
                        statement: "Identify the major branches of physics and their relation to technology",
                        description: "Explain how physics principles drive engineering and medical innovations.",
                        orderIndex: 1,
                      },
                    ],
                  },
                ],
              },
              {
                code: "U2",
                title: "Physical Quantities and Measurement",
                description: "SI units, precision instruments, and error analysis.",
                orderIndex: 2,
                topics: [
                  {
                    code: "U2T1",
                    title: "SI Units and Measuring Instruments",
                    description: "Base and derived physical quantities.",
                    orderIndex: 1,
                    objectives: [
                      {
                        code: "U2T1O1",
                        statement: "Distinguish between fundamental and derived physical quantities and their SI units",
                        description: "Express derived units in terms of base SI units.",
                        orderIndex: 1,
                      },
                      {
                        code: "U2T1O2",
                        statement: "Use vernier calipers and micrometer screw gauges for precision measurements",
                        description: "Demonstrate accurate zero-error calibration and vernier scale reading.",
                        orderIndex: 2,
                      },
                    ],
                  },
                ],
              },
              {
                code: "U3",
                title: "Motion in a Straight Line",
                description: "Kinematics in one dimension: distance, velocity, and acceleration.",
                orderIndex: 3,
                topics: [
                  {
                    code: "U3T1",
                    title: "Position, Distance, and Displacement",
                    description: "Scalar and vector descriptions of motion.",
                    orderIndex: 1,
                    objectives: [
                      {
                        code: "U3T1O1",
                        statement: "Differentiate between scalar and vector quantities in one-dimensional motion",
                        description: "Define distance as scalar and displacement as vector.",
                        orderIndex: 1,
                      },
                    ],
                  },
                  {
                    code: "U3T2",
                    title: "Uniform and Accelerated Motion",
                    description: "Equations of uniformly accelerated motion and graphical analysis.",
                    orderIndex: 2,
                    objectives: [
                      {
                        code: "U3T2O1",
                        statement: "Calculate velocity and acceleration from position-time and velocity-time graphs",
                        description: "Interpret slope and area under velocity-time curves.",
                        orderIndex: 1,
                      },
                      {
                        code: "U3T2O2",
                        statement: "Apply equations of uniformly accelerated motion to solve kinematics problems",
                        description: "Solve free-fall and linear acceleration word problems.",
                        orderIndex: 2,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            subjectCode: "CHEM",
            gradeLevel: 10,
            units: [
              {
                code: "U1",
                title: "Chemical Reactions and Stoichiometry",
                description: "Mole concept, balanced equations, and yield calculations.",
                orderIndex: 1,
                topics: [
                  {
                    code: "U1T1",
                    title: "Balancing Chemical Equations",
                    description: "Conservation of mass in chemical transformations.",
                    orderIndex: 1,
                    objectives: [
                      {
                        code: "U1T1O1",
                        statement: "Balance chemical equations using inspection and algebraic methods",
                        description: "Identify reactants, products, and physical state symbols.",
                        orderIndex: 1,
                      },
                    ],
                  },
                  {
                    code: "U1T2",
                    title: "The Mole Concept and Calculations",
                    description: "Avogadro's number, molar mass, and stoichiometric ratios.",
                    orderIndex: 2,
                    objectives: [
                      {
                        code: "U1T2O1",
                        statement: "Calculate molar masses and convert between moles, mass, and number of particles",
                        description: "Use Avogadro's constant to relate macroscopic and microscopic quantities.",
                        orderIndex: 1,
                      },
                      {
                        code: "U1T2O2",
                        statement: "Determine limiting reactants and percentage yields in chemical reactions",
                        description: "Calculate theoretical yield and identify excess reagents.",
                        orderIndex: 2,
                      },
                    ],
                  },
                ],
              },
              {
                code: "U2",
                title: "Solutions and Concentration",
                description: "Solubility equilibria, molarity, and dilution stoichiometry.",
                orderIndex: 2,
                topics: [
                  {
                    code: "U2T1",
                    title: "Types of Solutions and Solubility",
                    description: "Saturated, unsaturated, and supersaturated solutions.",
                    orderIndex: 1,
                    objectives: [
                      {
                        code: "U2T1O1",
                        statement: "Explain factors affecting solubility of solids and gases in liquids",
                        description: "Discuss temperature and pressure effects using Henry's Law.",
                        orderIndex: 1,
                      },
                    ],
                  },
                  {
                    code: "U2T2",
                    title: "Molarity and Dilution",
                    description: "Quantitative expression of solution concentrations.",
                    orderIndex: 2,
                    objectives: [
                      {
                        code: "U2T2O1",
                        statement: "Prepare standard solutions and calculate molarity and dilution concentrations",
                        description: "Apply M1V1 = M2V2 dilution formula accurately.",
                        orderIndex: 1,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        code: "V2",
        name: "Version 2 (2018)",
        description: "Upcoming revision incorporating digital competencies and revised practical exercises.",
        status: "DRAFT",
        subjects: [],
      },
    ],
  },
  {
    name: "Ethiopian Preparatory Natural Science Curriculum",
    code: "NAT181",
    description: "Advanced Natural Science Stream Curriculum for Grades 11-12 preparing students for higher education.",
    authorityName: "Ministry of Education",
    versions: [
      {
        code: "V1",
        name: "Version 1 (2018)",
        description: "Preparatory framework covering advanced mathematics, university-prep physics, chemistry, and biology.",
        status: "ACTIVE",
        subjects: [
          {
            subjectCode: "MATH",
            gradeLevel: 11,
            units: [
              {
                code: "U1",
                title: "Relations and Functions",
                description: "Advanced functional analysis, domain restrictions, composition, and inverse functions.",
                orderIndex: 1,
                topics: [
                  {
                    code: "U1T1",
                    title: "Composition and Inverses of Functions",
                    description: "Composite function operations and bijective inverse mappings.",
                    orderIndex: 1,
                    objectives: [
                      {
                        code: "U1T1O1",
                        statement: "Determine domains, ranges, compositions, and inverses of algebraic functions",
                        description: "Verify one-to-one and onto conditions for function invertibility.",
                        orderIndex: 1,
                      },
                    ],
                  },
                ],
              },
              {
                code: "U2",
                title: "Rational Expressions and Rational Functions",
                description: "Algebraic simplification, partial fractions, and rational graph analysis.",
                orderIndex: 2,
                topics: [
                  {
                    code: "U2T1",
                    title: "Asymptotes and Graphs of Rational Functions",
                    description: "Vertical, horizontal, and oblique asymptotes.",
                    orderIndex: 1,
                    objectives: [
                      {
                        code: "U2T1O1",
                        statement: "Find vertical, horizontal, and oblique asymptotes of rational functions",
                        description: "Sketch rational functions by finding intercepts and asymptotic limits.",
                        orderIndex: 1,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

export async function seedCurriculum(targetTenantId?: string): Promise<void> {
  await runWithoutTenant(async () => {
    const whereClause = targetTenantId
      ? { id: targetTenantId, status: "ACTIVE" as const }
      : { status: "ACTIVE" as const };

    const tenants = await prisma.tenant.findMany({
      where: whereClause,
      select: { id: true, code: true, name: true },
    });

    const allSubjects = await prisma.subject.findMany({
      select: { id: true, code: true, name: true },
    });
    const subjectMap = new Map<string, string>();
    for (const sub of allSubjects) {
      subjectMap.set(sub.code.toUpperCase(), sub.id);
    }

    const tenantIds = tenants.map((t) => t.id);
    const existingCurricula = await prisma.curriculum.findMany({
      where: {
        OR: [
          { tenantId: { in: tenantIds } },
          { scope: "SYSTEM" },
        ],
      },
      select: { id: true },
    });
    const currIds = existingCurricula.map((c) => c.id);

    if (currIds.length > 0) {
      const versions = await prisma.curriculumVersion.findMany({
        where: { curriculumId: { in: currIds } },
        select: { id: true },
      });
      const versionIds = versions.map((v) => v.id);

      if (versionIds.length > 0) {
        const currSubjects = await prisma.curriculumSubject.findMany({
          where: { curriculumVersionId: { in: versionIds } },
          select: { id: true },
        });
        const currSubjectIds = currSubjects.map((s) => s.id);

        if (currSubjectIds.length > 0) {
          const units = await prisma.curriculumUnit.findMany({
            where: { curriculumSubjectId: { in: currSubjectIds } },
            select: { id: true },
          });
          const unitIds = units.map((u) => u.id);

          if (unitIds.length > 0) {
            const topics = await prisma.curriculumTopic.findMany({
              where: { unitId: { in: unitIds } },
              select: { id: true },
            });
            const topicIds = topics.map((t) => t.id);

            if (topicIds.length > 0) {
              await prisma.learningObjective.deleteMany({
                where: { topicId: { in: topicIds } },
              });
              await prisma.curriculumTopic.deleteMany({
                where: { id: { in: topicIds } },
              });
            }

            await prisma.curriculumUnit.deleteMany({
              where: { id: { in: unitIds } },
            });
          }

          await prisma.curriculumSubject.deleteMany({
            where: { id: { in: currSubjectIds } },
          });
        }

        await prisma.curriculumVersion.deleteMany({
          where: { id: { in: versionIds } },
        });
      }

      await prisma.curriculum.deleteMany({
        where: { id: { in: currIds } },
      });
    }

    for (const tenant of tenants) {
      const allGrades = await prisma.grade.findMany({
        where: { tenantId: tenant.id },
        select: { id: true, level: true },
      });
      const gradeMap = new Map<number, string>();
      for (const gr of allGrades) {
        gradeMap.set(gr.level, gr.id);
      }

      for (const currSeed of ETHIOPIAN_CURRICULUM_SEEDS) {
        const curriculum = await prisma.curriculum.upsert({
          where: {
            tenantId_code: {
              tenantId: tenant.id,
              code: currSeed.code,
            },
          },
          update: {
            name: currSeed.name,
            description: currSeed.description,
            authorityName: currSeed.authorityName,
            status: "ACTIVE",
          },
          create: {
            tenantId: tenant.id,
            name: currSeed.name,
            code: currSeed.code,
            description: currSeed.description,
            authorityName: currSeed.authorityName,
            scope: "TENANT",
            status: "ACTIVE",
          },
        });

        for (const verSeed of currSeed.versions) {
          const version = await prisma.curriculumVersion.upsert({
            where: {
              curriculumId_code: {
                curriculumId: curriculum.id,
                code: verSeed.code,
              },
            },
            update: {
              name: verSeed.name,
              description: verSeed.description,
              status: verSeed.status,
            },
            create: {
              curriculumId: curriculum.id,
              code: verSeed.code,
              name: verSeed.name,
              description: verSeed.description,
              status: verSeed.status,
            },
          });

          for (const subSeed of verSeed.subjects) {
            const gradeId = gradeMap.get(subSeed.gradeLevel);
            const subjectId = subjectMap.get(subSeed.subjectCode.toUpperCase());

            if (!gradeId || !subjectId) {
              continue;
            }

            const currSubject = await prisma.curriculumSubject.upsert({
              where: {
                curriculumVersionId_gradeId_subjectId: {
                  curriculumVersionId: version.id,
                  gradeId,
                  subjectId,
                },
              },
              update: {},
              create: {
                curriculumVersionId: version.id,
                gradeId,
                subjectId,
              },
            });

            for (const unitSeed of subSeed.units) {
              const unit = await prisma.curriculumUnit.upsert({
                where: {
                  curriculumSubjectId_code: {
                    curriculumSubjectId: currSubject.id,
                    code: unitSeed.code,
                  },
                },
                update: {
                  title: unitSeed.title,
                  description: unitSeed.description || null,
                  orderIndex: unitSeed.orderIndex,
                },
                create: {
                  curriculumSubjectId: currSubject.id,
                  code: unitSeed.code,
                  title: unitSeed.title,
                  description: unitSeed.description || null,
                  orderIndex: unitSeed.orderIndex,
                },
              });

              for (const topicSeed of unitSeed.topics) {
                const topic = await prisma.curriculumTopic.upsert({
                  where: {
                    unitId_code: {
                      unitId: unit.id,
                      code: topicSeed.code,
                    },
                  },
                  update: {
                    title: topicSeed.title,
                    description: topicSeed.description || null,
                    orderIndex: topicSeed.orderIndex,
                  },
                  create: {
                    unitId: unit.id,
                    code: topicSeed.code,
                    title: topicSeed.title,
                    description: topicSeed.description || null,
                    orderIndex: topicSeed.orderIndex,
                  },
                });

                for (const objSeed of topicSeed.objectives) {
                  await prisma.learningObjective.upsert({
                    where: {
                      topicId_code: {
                        topicId: topic.id,
                        code: objSeed.code,
                      },
                    },
                    update: {
                      statement: objSeed.statement,
                      description: objSeed.description || null,
                      orderIndex: objSeed.orderIndex,
                    },
                    create: {
                      topicId: topic.id,
                      code: objSeed.code,
                      statement: objSeed.statement,
                      description: objSeed.description || null,
                      orderIndex: objSeed.orderIndex,
                    },
                  });
                }
              }
            }
          }
        }
      }
    }
  });
}
