'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating AI-powered task title suggestions.
 *
 * The flow uses a prompt to generate title suggestions based on a given task description.
 * - `getTaskTitleSuggestions`: A function that takes a task description and returns suggested titles.
 * - `TaskTitleSuggestionsInput`: The input type for the `getTaskTitleSuggestions` function.
 * - `TaskTitleSuggestionsOutput`: The return type for the `getTaskTitleSuggestions` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaskTitleSuggestionsInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('A description of the task for which to generate title suggestions.'),
});
export type TaskTitleSuggestionsInput = z.infer<typeof TaskTitleSuggestionsInputSchema>;

const TaskTitleSuggestionsOutputSchema = z.object({
  titleSuggestions: z
    .array(z.string())
    .describe('An array of suggested titles for the task.'),
});
export type TaskTitleSuggestionsOutput = z.infer<typeof TaskTitleSuggestionsOutputSchema>;

export async function getTaskTitleSuggestions(
  input: TaskTitleSuggestionsInput
): Promise<TaskTitleSuggestionsOutput> {
  return taskTitleSuggestionsFlow(input);
}

const taskTitleSuggestionsPrompt = ai.definePrompt({
  name: 'taskTitleSuggestionsPrompt',
  input: {schema: TaskTitleSuggestionsInputSchema},
  output: {schema: TaskTitleSuggestionsOutputSchema},
  prompt: `You are a helpful assistant that generates creative and descriptive task titles based on a given task description.

  Task Description: {{{taskDescription}}}

  Generate 3 title suggestions that are concise and accurately reflect the task. Return them as a JSON array of strings.
  Ensure the array is parsable.
  `,
});

const taskTitleSuggestionsFlow = ai.defineFlow(
  {
    name: 'taskTitleSuggestionsFlow',
    inputSchema: TaskTitleSuggestionsInputSchema,
    outputSchema: TaskTitleSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await taskTitleSuggestionsPrompt(input);
    return output!;
  }
);
