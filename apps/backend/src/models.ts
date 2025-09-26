import { google } from '@ai-sdk/google';
import { LanguageModel } from 'ai';

export const resumeParserModel: LanguageModel = google('gemini-2.5-flash');
