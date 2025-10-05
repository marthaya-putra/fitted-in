export const actions = {
  sidePanelReady: "side-panel-ready",
  resetPanel: "reset-panel",
  updateJobTitle: "update-job-title",
  extractJobDescription: "extract-job-description",
  openSidePanel: "open-side-panel",
  optimizeResume: "optimize-resume",
} as const;

export type ActionType = (typeof actions)[keyof typeof actions];

export const sidePanelStateStorageKey = "side-panel-state";

export type SidePanelState = "opened" | null;
