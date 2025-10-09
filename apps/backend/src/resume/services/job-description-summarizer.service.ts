import { Injectable } from '@nestjs/common';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { defaultModel } from '../models';

@Injectable()
export class JobDescriptionSummarizerService {
  private readonly model = defaultModel;

  async summarize(jobDescription: string): Promise<string> {
    try {
      const prompt = `Summarize the following job description into a concise format that captures all the key information while reducing the token count significantly. Focus on:

1. Job title and company
2. Key responsibilities and duties
3. Required qualifications and skills
4. Preferred qualifications
5. Experience level required
6. Any notable benefits or unique aspects

Keep the summary under 500 tokens while preserving all essential information that would be relevant for resume matching or job application purposes.

Job Description:
${jobDescription}`;

      const { text } = await generateText({
        model: this.model,
        prompt: prompt,
        system:
          'You are a helpful assistant that summarizes job descriptions concisely while preserving all key information. Keep summaries under 500 tokens.',
      });

      return text.trim();
    } catch (error) {
      console.error('Error summarizing job description:', error);
      throw new Error('Failed to summarize job description');
    }
  }
}
