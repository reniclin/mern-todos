declare interface Todo {
  _id?: string | undefined;            // id generated by MongoDB
  title: string;          // Todo item's title
  description?: string | undefined;   // Todo item's description
  category: string;       // Todo item's category
  isFinished: boolean;    // Is todo item finished
  createdAtUtc?: string | undefined;   // Todo create time (ISO 8601)
  updatedAtUtc?: string | undefined;   // Todo update time (ISO 8601)
  dueDateUtc?: string | undefined;
}