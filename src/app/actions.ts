'use server';

import { getAccessToken } from '@auth0/nextjs-auth0';
import { revalidatePath } from 'next/cache';
import { ZodError, z } from 'zod';

import { getTaskDescriptionSuggestions as getAiSuggestionsFlow } from '@/ai/flows/ai-task-description-suggestions';
import type { Task } from '@/lib/types';

const API_BASE_URL = process.env.API_BASE_URL;

const TaskSchema = z.object({
  title: z.string().min(1, { message: 'Title is required.' }),
  description: z.string().optional(),
});

type ActionResponse<T> = {
  data?: T;
  error?: string | ZodError['formErrors'];
};

async function getAuthHeaders() {
  try {
    const { accessToken } = await getAccessToken();
    if (!accessToken) {
      throw new Error('Not authenticated');
    }
    return {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
  } catch (error) {
    console.error('Failed to get access token:', error);
    throw new Error('Authentication failed.');
  }
}

export async function getTasks(): Promise<ActionResponse<Task[]>> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      headers,
      next: { tags: ['tasks'] },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      return { error: `Failed to fetch tasks: ${response.statusText}` };
    }
    const data = await response.json();
    return { data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error(message);
    return { error: message };
  }
}

export async function createTask(
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse<Task>> {
  const validatedFields = TaskSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.formErrors };
  }

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify(validatedFields.data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { error: `Failed to create task: ${errorText}` };
    }

    revalidatePath('/');
    return { data: await response.json() };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { error: message };
  }
}

export async function updateTask(
  id: number,
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse<Task>> {
  const validatedFields = TaskSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.formErrors };
  }

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(validatedFields.data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { error: `Failed to update task: ${errorText}` };
    }

    revalidatePath('/');
    return { data: await response.json() };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { error: message };
  }
}

export async function toggleTaskCompletion(task: Task): Promise<ActionResponse<Task>> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/tasks/${task.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ ...task, completed: !task.completed }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { error: `Failed to update task: ${errorText}` };
    }

    revalidatePath('/');
    return { data: await response.json() };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { error: message };
  }
}

export async function deleteTask(id: number): Promise<ActionResponse<null>> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { error: `Failed to delete task: ${errorText}` };
    }

    revalidatePath('/');
    return { data: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { error: message };
  }
}

export async function getAiSuggestions(
  title: string
): Promise<ActionResponse<string[]>> {
  if (!title) {
    return { error: 'A task title is required to generate suggestions.' };
  }
  try {
    const result = await getAiSuggestionsFlow({ taskTitle: title });
    return { data: result.suggestions };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get AI suggestions.';
    return { error: message };
  }
}
