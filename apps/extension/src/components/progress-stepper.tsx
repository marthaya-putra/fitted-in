import { Check, Loader2, Circle } from "lucide-react";

type StatusItem = {
  stage: string;
  message: string;
  status: "in-progress" | "done";
};

const STAGES = [
  { id: "summarizing", label: "Summarizing Job Description" },
  { id: "summary", label: "Optimizing Your Summary" },
  { id: "skills", label: "Optimizing Your Skills" },
  { id: "experience", label: "Optimizing Your Experience" },
  { id: "formatting", label: "Formatting Resume" },
] as const;

function getStepStatus(
  stageId: string,
  statusItems: StatusItem[]
): "pending" | "in-progress" | "done" {
  if (statusItems.some(s => s.stage === stageId && s.status === "done"))
    return "done";
  if (statusItems.some(s => s.stage === stageId && s.status === "in-progress"))
    return "in-progress";
  return "pending";
}

export function ProgressStepper({ statusItems }: { statusItems: StatusItem[] }) {
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <ol className="relative">
        {/* Vertical connector rail behind the badges; fills to progress. */}
        {STAGES.map((stage, index) => {
          const stepStatus = getStepStatus(stage.id, statusItems);
          const isLast = index === STAGES.length - 1;
          const connectorActive =
            stepStatus === "done" || stepStatus === "in-progress";
          return (
            <li
              key={stage.id}
              className="animate-stagger-in relative flex items-center gap-3 pb-3 last:pb-0"
              style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
            >
              {/* Connector line to the next step (hidden on last). */}
              {!isLast && (
                <span
                  className="absolute left-[13px] top-7 w-px h-[calc(100%-12px)] transition-colors duration-200"
                  style={{
                    backgroundColor: connectorActive
                      ? "hsl(var(--primary) / 0.3)"
                      : "hsl(var(--border))",
                  }}
                />
              )}
              <div
                className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                  stepStatus === "done"
                    ? "bg-green-500"
                    : stepStatus === "in-progress"
                      ? "bg-primary"
                      : "bg-muted border border-border"
                }`}
              >
                {stepStatus === "done" ? (
                  <Check className="w-3.5 h-3.5 text-white" />
                ) : stepStatus === "in-progress" ? (
                  <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-muted-foreground/40" />
                )}
              </div>
              <span
                className={`text-[13px] font-medium transition-colors duration-200 ${
                  stepStatus === "done"
                    ? "text-green-700"
                    : stepStatus === "in-progress"
                      ? "text-foreground"
                      : "text-muted-foreground"
                }`}
              >
                {stage.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
