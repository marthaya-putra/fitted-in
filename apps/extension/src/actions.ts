export const actions = {
  extractJobDescription: "extract-job-description",
  openSidePanel: "open-side-panel",
  optimizeResume: "optimize-resume",
} as const;

export type ActionType = (typeof actions)[keyof typeof actions];
