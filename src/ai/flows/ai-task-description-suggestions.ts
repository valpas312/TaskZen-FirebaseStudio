'use server';

/**
 * @fileOverview Provides AI-powered task description suggestions.
 *
 * - `getTaskDescriptionSuggestions` -  A function that suggests task descriptions based on a given task title.
 * - `TaskDescriptionSuggestionsInput` - The input type for the `getTaskDescriptionSuggestions` function.
 * - `TaskDescriptionSuggestionsOutput` - The output type for the `getTaskDescriptionSuggestions` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaskDescriptionSuggestionsInputSchema = z.object({
  taskTitle: z
    .string()
    .describe('The title of the task for which to generate description suggestions.'),
});
export type TaskDescriptionSuggestionsInput = z.infer<
  typeof TaskDescriptionSuggestionsInputSchema
>;

const TaskDescriptionSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggested task descriptions.'),
});
export type TaskDescriptionSuggestionsOutput = z.infer<
  typeof TaskDescriptionSuggestionsOutputSchema
>;

export async function getTaskDescriptionSuggestions(
  input: TaskDescriptionSuggestionsInput
): Promise<TaskDescriptionSuggestionsOutput> {
  return taskDescriptionSuggestionsFlow(input);
}

const taskDescriptionSuggestionsPrompt = ai.definePrompt({
  name: 'taskDescriptionSuggestionsPrompt',
  input: {schema: TaskDescriptionSuggestionsInputSchema},
  output: {schema: TaskDescriptionSuggestionsOutputSchema},
  prompt: `You are a helpful task management assistant. Generate three diverse task description suggestions for the task with the following title:

Task Title: {{{taskTitle}}}

Format each suggestion as a concise sentence.

{{#each suggestions}}
{{@index}}. {{this}}
{{/each}}`,
});

const taskDescriptionSuggestionsFlow = ai.defineFlow(
  {
    name: 'taskDescriptionSuggestionsFlow',
    inputSchema: TaskDescriptionSuggestionsInputSchema,
    outputSchema: TaskDescriptionSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await taskDescriptionSuggestionsPrompt(input);
    return output!;
  }
);
