export type Task = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
};

export const TaskSchema = {
  title: 'string',
  description: 'string',
};
