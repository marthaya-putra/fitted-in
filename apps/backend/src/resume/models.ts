import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";
import { type LanguageModel } from "ai";

export function getModel(): LanguageModel {
  const provider = process.env.AI_PROVIDER || "google";

  if (provider === "mistral") {
    return mistral("mistral-large-latest");
  }
  return google("gemini-3-flash-preview");
}

export const ocrModel: LanguageModel = mistral("pixtral-12b-2409");
