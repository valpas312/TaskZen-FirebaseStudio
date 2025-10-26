'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Sparkles } from 'lucide-react';
import { useActionState, useEffect, useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { createTask, updateTask, getAiSuggestions } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';

const TaskFormSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty.'),
  description: z.string().optional(),
});

type TaskFormData = z.infer<typeof TaskFormSchema>;

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Save Task
    </Button>
  );
}

export function TaskForm({ open, onOpenChange, task }: TaskFormProps) {
  const { toast } = useToast();
  const [isAiPending, startAiTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const formAction = task ? updateTask.bind(null, task.id) : createTask;
  const [state, dispatch] = useActionState(formAction, undefined);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(TaskFormSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
    },
  });

  const taskTitle = form.watch('title');

  useEffect(() => {
    if (!open) {
      form.reset({
        title: task?.title || '',
        description: task?.description || '',
      });
      setSuggestions([]);
    }
  }, [open, form, task]);

  useEffect(() => {
    if (state?.error) {
      const errorMessage =
        typeof state.error === 'string'
          ? state.error
          : 'Please check the form for errors.';
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: errorMessage,
      });
    } else if (state?.data) {
      toast({
        title: `Task ${task ? 'updated' : 'created'}`,
        description: `"${state.data.title}" has been saved.`,
      });
      onOpenChange(false);
    }
  }, [state, task, onOpenChange, toast]);

  const handleGetSuggestions = () => {
    if (!taskTitle) {
      toast({
        variant: 'destructive',
        title: 'Title required',
        description: 'Please enter a title before getting suggestions.',
      });
      return;
    }
    startAiTransition(async () => {
      const result = await getAiSuggestions(taskTitle);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'AI Assistant Error',
          description: result.error.toString(),
        });
        setSuggestions([]);
      } else if (result.data) {
        setSuggestions(result.data);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <form action={dispatch}>
          <DialogHeader className="text-center">
            <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            <DialogDescription>
              {task
                ? "Update your task's details below."
                : 'Fill out the details for your new task.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 items-center gap-4">
              <Label htmlFor="title" className="text-left">
                Title
              </Label>
              <div className="col-span-3">
                <Input
                  id="title"
                  {...form.register('title')}
                  className={cn(
                    form.formState.errors.title && 'border-destructive'
                  )}
                  name="title"
                  defaultValue={task?.title}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 items-start gap-4">
              <Label htmlFor="description" className="text-left pt-2">
                Description
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="description"
                  {...form.register('description')}
                  name="description"
                  defaultValue={task?.description}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={handleGetSuggestions}
                  disabled={isAiPending}
                >
                  {isAiPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Suggest Descriptions
                </Button>

                {isAiPending && (
                  <p className="text-sm text-muted-foreground mt-2">
                    AI is thinking...
                  </p>
                )}

                {suggestions.length > 0 && (
                  <div className="mt-2 space-y-2 bg-background p-4 rounded-md shadow-lg z-50">
                    <p className="text-sm font-medium">Suggestions:</p>
                    {suggestions.map((s, i) => (
                      <Button
                        key={i}
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full text-left justify-start h-auto"
                        onClick={() => form.setValue('description', s)}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
