import { LogOut, ChevronDown } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";

interface UserMenuProps {
  userLabel: string;
  email: string;
  name: string | null;
  onSignOut: () => void;
}

export function UserMenu({ userLabel, email, name, onSignOut }: UserMenuProps) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="flex items-center gap-1.5 py-1 px-1.5 rounded-lg bg-card border border-border shadow-sm hover:shadow-md hover:border-border transition-all duration-150 btn-press">
          <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-xs">
              {userLabel[0]?.toUpperCase()}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          side="top"
          sideOffset={8}
          className="bg-popover rounded-lg border border-border shadow-lg p-1 min-w-[200px] z-50 animate-slide-in"
        >
          <div className="px-3 py-2 border-b border-border">
            <p className="text-[13px] font-medium text-foreground truncate">
              {email}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {name || "User"}
            </p>
          </div>
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-foreground/80 hover:bg-muted rounded-md transition-colors duration-150"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
          <Popover.Arrow className="fill-border" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
