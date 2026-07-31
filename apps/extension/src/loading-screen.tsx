import { Loader2, Briefcase } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="h-screen flex items-center justify-center bg-background animate-fade-in">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-b from-primary/15 to-primary/5 rounded-2xl ring-1 ring-primary/10 mb-4">
          <Briefcase className="w-6 h-6 text-primary" />
        </div>
        <div className="flex items-center justify-center mb-3">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
        <p className="text-[13px] text-muted-foreground font-medium">
          Loading FittedIn...
        </p>
      </div>
    </div>
  );
}
