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
      <div className="space-y-2">
        {STAGES.map((stage, index) => {
          const stepStatus = getStepStatus(stage.id, statusItems);
          return (
            <div
              key={stage.id}
              className="animate-stagger-in"
              style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
            >
              <div
                className={`flex items-center gap-3 p-3 rounded-md border transition-all duration-200 ${
                  stepStatus === "done"
                    ? "bg-green-50 border-green-200"
                    : stepStatus === "in-progress"
                      ? "bg-primary/5 border-primary/20"
                      : "bg-muted/50 border-border"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    stepStatus === "done"
                      ? "bg-green-500"
                      : stepStatus === "in-progress"
                        ? "bg-primary"
                        : "bg-border"
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
