import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";
import { type LanguageModel } from "ai";

export function getModel(): LanguageModel {
  const provider = process.env.AI_PROVIDER || "google";

  if (provider === "mistral") {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return mistral("mistral-large-latest");
  }
  return google("gemini-2.5-flash");
}

export const ocrModel: LanguageModel = google("gemini-2.5-flash-lite");
