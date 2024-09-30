export interface SqlTodo {
  id?: string;
  title: string;
  description: string;
  category: string;
  isFinished?: boolean;
  createdAtUtc?: Date;
  updatedAtUtc?: Date;
  dueDateUtc?: Date;
}
