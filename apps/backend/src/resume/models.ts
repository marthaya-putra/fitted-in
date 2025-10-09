import { google } from '@ai-sdk/google';
import { LanguageModel } from 'ai';

export const defaultModel: LanguageModel = google('gemini-2.5-flash');
