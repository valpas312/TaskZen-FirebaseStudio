'use client';

import { AlertCircle, Plus, ServerCrash } from 'lucide-react';
import { useState } from 'react';

import { TaskItem } from '@/components/TaskItem';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { Task } from '@/lib/types';
import { TaskForm } from './TaskForm';

interface TaskListProps {
  initialTasks: Task[];
  apiError?: string;
}

export function TaskList({ initialTasks, apiError }: TaskListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  if (apiError) {
    return (
      <Alert variant="destructive">
        <ServerCrash className="h-4 w-4" />
        <AlertTitle>Error Fetching Tasks</AlertTitle>
        <AlertDescription>{apiError}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold font-headline">Your Tasks</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Task
        </Button>
      </div>

      <TaskForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      {initialTasks.length > 0 ? (
        <div className="space-y-4">
          {initialTasks
            .sort((a, b) => Number(a.completed) - Number(b.completed) || b.id - a.id)
            .map(task => (
              <TaskItem key={task.id} task={task} />
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            No tasks yet
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get started by creating a new task.
          </p>
        </div>
      )}
    </>
  );
}
