import { Sparkles, Briefcase } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-muted rounded-full mb-3">
        <Sparkles className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="text-[13px] text-muted-foreground">
        Click &quot;Optimize My CV&quot; to get started
      </p>
    </div>
  );
}

export function EmptyNoJob() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-muted rounded-full mb-3">
        <Briefcase className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="text-[13px] text-muted-foreground mb-1">
        No job selected
      </p>
      <p className="text-[11px] text-muted-foreground tracking-wide">
        Navigate to a LinkedIn job posting to optimize your resume
      </p>
    </div>
  );
}
