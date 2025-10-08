export const actions = {
  historyStateUpdated: "history-state-updated",
  sidePanelReady: "side-panel-ready",
  resetPanel: "reset-panel",
  updateJobTitle: "update-job-title",
  extractJobDescription: "extract-job-description",
  openSidePanel: "open-side-panel",
  optimizeResume: "optimize-resume",
  streaming: "streaming",
  streamingEnded: "streaming-ended",
} as const;

export type ActionType = (typeof actions)[keyof typeof actions];
