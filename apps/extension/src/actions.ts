export const actions = {
  extractJobDescription: "extract-job-description",
  extractJobDescriptionFromContent: "extract-job-description-from-content",
  openSidePanel: "open-side-panel",
} as const;

export type ActionType = (typeof actions)[keyof typeof actions];
