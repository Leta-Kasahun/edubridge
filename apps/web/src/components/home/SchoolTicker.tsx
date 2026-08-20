interface EthiopianSchool {
  readonly id: string;
  readonly name: string;
  readonly grades: string;
  readonly location: string;
  readonly badge: string;
  readonly accent: string;
}

const ETHIOPIAN_SCHOOLS: readonly EthiopianSchool[] = [
  {
    id: "wingate",
    name: "General Wingate Preparatory School",
    grades: "Grades 9–12",
    location: "Addis Ababa",
    badge: "GWS",
    accent: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  },
  {
    id: "bole",
    name: "Bole Senior Secondary School",
    grades: "Grades 9–12",
    location: "Addis Ababa",
    badge: "BSS",
    accent: "bg-sky-500/10 text-sky-700 border-sky-200",
  },
  {
    id: "st-joseph",
    name: "St. Joseph School",
    grades: "Grades 7–12",
    location: "Addis Ababa",
    badge: "SJS",
    accent: "bg-amber-500/10 text-amber-700 border-amber-200",
  },
  {
    id: "guebre-mariam",
    name: "Lycée Guébré-Mariam",
    grades: "Grades 7–12",
    location: "Addis Ababa",
    badge: "LGM",
    accent: "bg-indigo-500/10 text-indigo-700 border-indigo-200",
  },
  {
    id: "sandford",
    name: "Sandford High School",
    grades: "Grades 7–12",
    location: "Addis Ababa",
    badge: "SIS",
    accent: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  },
  {
    id: "gibson",
    name: "Gibson Youth Academy Secondary",
    grades: "Grades 7–12",
    location: "Addis Ababa",
    badge: "GYA",
    accent: "bg-violet-500/10 text-violet-700 border-violet-200",
  },
  {
    id: "school-of-tomorrow",
    name: "School of Tomorrow Secondary",
    grades: "Grades 7–12",
    location: "Addis Ababa",
    badge: "SOT",
    accent: "bg-teal-500/10 text-teal-700 border-teal-200",
  },
  {
    id: "south-west",
    name: "South West Academy Secondary",
    grades: "Grades 7–12",
    location: "Addis Ababa",
    badge: "SWA",
    accent: "bg-rose-500/10 text-rose-700 border-rose-200",
  },
  {
    id: "nazareth",
    name: "Nazareth School",
    grades: "Grades 7–12",
    location: "Addis Ababa",
    badge: "NZS",
    accent: "bg-amber-500/10 text-amber-700 border-amber-200",
  },
  {
    id: "hillside",
    name: "Hillside Secondary School",
    grades: "Grades 7–12",
    location: "Addis Ababa",
    badge: "HSS",
    accent: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  },
  {
    id: "menelik",
    name: "Menelik II Secondary School",
    grades: "Grades 9–12",
    location: "Addis Ababa",
    badge: "MSS",
    accent: "bg-cyan-500/10 text-cyan-700 border-cyan-200",
  },
];

export function SchoolTicker() {
  return (
    <section
      aria-label="Ethiopian Secondary & Middle Schools"
      className="w-full border-b border-border bg-card py-3.5 overflow-hidden"
    >
      <div className="relative w-full overflow-hidden mask-[linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="animate-marquee gap-4 sm:gap-6 py-0.5">
          {[...ETHIOPIAN_SCHOOLS, ...ETHIOPIAN_SCHOOLS].map((school, idx) => (
            <div
              key={`${school.id}-${idx}`}
              className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-background border border-border shadow-2xs shrink-0 cursor-default"
            >
              <div
                className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs border ${school.accent}`}
              >
                {school.badge}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-foreground tracking-tight whitespace-nowrap">
                  {school.name}
                </span>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground whitespace-nowrap">
                  <span>{school.grades}</span>
                  <span>•</span>
                  <span>{school.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
