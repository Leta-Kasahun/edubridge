import React, { useState } from "react";
import { BookOpen } from "lucide-react";
import {
  SingleStudentMasteryResponse,
  StudentMasteryTopicItem,
  MasteryLevel,
} from "../types/mastery.types";
import { StudentMasteryCard } from "./StudentMasteryCard";
import { MasteryProgressBar } from "./MasteryProgressBar";
import { MasteryHistoryModal } from "./MasteryHistoryModal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface StudentMasteryViewProps {
  readonly data: SingleStudentMasteryResponse;
}

export function StudentMasteryView({
  data,
}: StudentMasteryViewProps): React.JSX.Element {
  const [selectedTopic, setSelectedTopic] = useState<{
    topicId: string;
    topicTitle: string;
    level: MasteryLevel;
    accuracy?: number | null;
  } | null>(null);

  const subjects = data.subjects;
  const initialSubject = subjects[0]?.subjectId || "";
  const [activeSubjectId, setActiveSubjectId] = useState(initialSubject);

  const currentSubject =
    subjects.find((s) => s.subjectId === activeSubjectId) || subjects[0];

  return (
    <div className="space-y-6">
      {/* Student Profile Header Banner */}
      <div className="p-5 bg-card rounded-xl border border-border shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary uppercase">
              Grade {data.student.gradeLevel}
              {data.student.sectionName ? ` · Section ${data.student.sectionName}` : ""}
            </span>
            {data.student.rollNumber && (
              <span className="text-xs text-muted-foreground font-mono">
                ID: {data.student.rollNumber}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {data.student.name}
          </h2>
          <p className="text-xs text-muted-foreground">
            Competency-based performance profile across enrolled curriculum subjects.
          </p>
        </div>

        {/* Aggregate metrics */}
        {currentSubject && (
          <div className="p-3 bg-muted/40 rounded-lg border border-border flex items-center gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Mastered Topics:</span>
              <p className="text-sm font-bold text-emerald-600">
                {currentSubject.masteredCount} / {currentSubject.totalTopics}
              </p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <span className="text-muted-foreground">Subject Accuracy:</span>
              <p className="text-sm font-bold text-foreground">
                {currentSubject.overallAccuracy !== null ? `${currentSubject.overallAccuracy}%` : "—"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Subject Navigation Tabs */}
      {subjects.length === 0 ? (
        <div className="p-8 text-center bg-card rounded-xl border border-border text-muted-foreground text-sm">
          No subjects or curriculum units mapped for this grade level.
        </div>
      ) : (
        <Tabs
          value={activeSubjectId || initialSubject}
          onValueChange={setActiveSubjectId}
          className="space-y-6"
        >
          <TabsList className="bg-muted/60 p-1 rounded-xl flex-wrap h-auto gap-1">
            {subjects.map((sub) => (
              <TabsTrigger
                key={sub.subjectId}
                value={sub.subjectId}
                className="px-4 py-2 text-xs font-medium rounded-lg"
              >
                <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                {sub.subjectName}
              </TabsTrigger>
            ))}
          </TabsList>

          {subjects.map((subject) => (
            <TabsContent
              key={subject.subjectId}
              value={subject.subjectId}
              className="space-y-6 focus-visible:outline-none"
            >
              {/* Subject Overview Card */}
              <div className="p-4 bg-card rounded-xl border border-border space-y-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {subject.subjectName} Progress
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Continuous evaluation across all units and learning competency indicators.
                    </p>
                  </div>
                  <div className="text-xs font-semibold text-foreground">
                    {subject.masteredCount} of {subject.totalTopics} Topics Mastered (
                    {Math.round((subject.masteredCount / (subject.totalTopics || 1)) * 100)}%)
                  </div>
                </div>
                <MasteryProgressBar
                  value={
                    subject.totalTopics > 0
                      ? (subject.masteredCount / subject.totalTopics) * 100
                      : 0
                  }
                  size="md"
                />
              </div>

              {/* Units & Topics Grid */}
              <div className="space-y-6">
                {subject.units.map((unit) => (
                  <div
                    key={unit.unitId}
                    className="p-4 bg-muted/20 rounded-xl border border-border space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-muted text-foreground">
                        {unit.unitCode}
                      </span>
                      <h4 className="text-sm font-semibold text-foreground">
                        {unit.unitTitle}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {unit.topics.map((topic: StudentMasteryTopicItem) => (
                        <StudentMasteryCard
                          key={topic.topicId}
                          topic={topic}
                          onClick={() =>
                            setSelectedTopic({
                              topicId: topic.topicId,
                              topicTitle: topic.topicTitle,
                              level: topic.level,
                              accuracy: topic.accuracy,
                            })
                          }
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* History Modal */}
      {selectedTopic && (
        <MasteryHistoryModal
          open={Boolean(selectedTopic)}
          onOpenChange={(open) => {
            if (!open) setSelectedTopic(null);
          }}
          studentId={data.student.id}
          studentName={data.student.name}
          topicId={selectedTopic.topicId}
          topicTitle={selectedTopic.topicTitle}
          currentLevel={selectedTopic.level}
          currentAccuracy={selectedTopic.accuracy}
        />
      )}
    </div>
  );
}
