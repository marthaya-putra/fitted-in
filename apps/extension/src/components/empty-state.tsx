import { Sparkles, Briefcase } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
      <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-b from-primary/15 to-primary/5 rounded-2xl ring-1 ring-primary/10 mb-4">
        <Sparkles className="w-6 h-6 text-primary" />
      </div>
      <p className="text-[13px] font-medium text-foreground mb-1">
        Ready to optimize
      </p>
      <p className="text-[12px] text-muted-foreground">
        Click &quot;Optimize My CV&quot; to tailor your resume
      </p>
    </div>
  );
}

export function EmptyNoJob() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
      <div className="inline-flex items-center justify-center w-14 h-14 bg-muted rounded-2xl mb-4">
        <Briefcase className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="text-[13px] font-medium text-foreground mb-1">
        No job selected
      </p>
      <p className="text-[11px] text-muted-foreground tracking-wide">
        Navigate to a LinkedIn job posting to optimize your resume
      </p>
    </div>
  );
}
