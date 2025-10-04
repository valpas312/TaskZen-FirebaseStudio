'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { useOptimistic, useState, useTransition } from 'react';
import { deleteTask, toggleTaskCompletion } from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { TaskForm } from './TaskForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function TaskItem({ task }: { task: Task }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  const [optimisticTask, setOptimisticTask] = useOptimistic(
    task,
    (state, newCompleted: boolean) => ({ ...state, completed: newCompleted })
  );

  const handleToggle = () => {
    startTransition(async () => {
      setOptimisticTask(!optimisticTask.completed);
      const result = await toggleTaskCompletion(optimisticTask);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error updating task',
          description: result.error,
        });
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteTask(optimisticTask.id);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error deleting task',
          description: result.error,
        });
      } else {
        toast({
          title: 'Task deleted',
          description: `"${optimisticTask.title}" has been removed.`,
        });
      }
    });
  };

  return (
    <>
      <Card
        className={cn(
          'transition-all',
          optimisticTask.completed ? 'bg-card/50' : 'bg-card'
        )}
      >
        <CardContent className="p-4 flex items-start gap-4">
          <Checkbox
            id={`task-${optimisticTask.id}`}
            checked={optimisticTask.completed}
            onCheckedChange={handleToggle}
            className="mt-1"
            aria-label={`Mark "${optimisticTask.title}" as ${
              optimisticTask.completed ? 'incomplete' : 'complete'
            }`}
            disabled={isPending}
          />
          <div className="grid gap-1 flex-1">
            <label
              htmlFor={`task-${optimisticTask.id}`}
              className={cn(
                'font-medium text-base cursor-pointer transition-all',
                optimisticTask.completed &&
                  'line-through text-muted-foreground'
              )}
            >
              {optimisticTask.title}
            </label>
            <p
              className={cn(
                'text-sm text-muted-foreground transition-all',
                optimisticTask.completed && 'line-through'
              )}
            >
              {optimisticTask.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditFormOpen(true)}
              disabled={isPending}
              aria-label={`Edit task "${optimisticTask.title}"`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={isPending}
                  aria-label={`Delete task "${optimisticTask.title}"`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the task "{optimisticTask.title}". This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
      <TaskForm
        open={isEditFormOpen}
        onOpenChange={setIsEditFormOpen}
        task={optimisticTask}
      />
    </>
  );
}
