export type Task = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
};

export const TaskSchema = {
  id: 'number',
  title: 'string',
  description: 'string',
  completed: 'boolean',
};
