import {
  API_ADD_TODO,
  API_DELETE_TODO,
  API_GET_TODO,
  API_PATCH_TODO,
  API_SQL_ADD_TODO,
  API_SQL_DELETE_TODO,
  API_SQL_GET_TODO,
  API_SQL_PATCH_TODO,
} from '../config/api';

export enum DatabaseOptions {
  MongoDb = 'MongoDb',
  PostgreSql = 'PostgreSql',
}

export const createTodo = async (
  todo: Todo,
  database: DatabaseOptions = DatabaseOptions.MongoDb
): Promise<Todo> => {
  const endpoint = (() => {
    if (database === DatabaseOptions.MongoDb) {
      return API_ADD_TODO;
    }
    return API_SQL_ADD_TODO;
  })();

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(todo),
  });

  if (!response.ok) {
    throw new Error(`Failed to create new todo: ${response.statusText}`);
  }

  return await response.json();
};

export const getTodoList = async (
  database: DatabaseOptions = DatabaseOptions.MongoDb
): Promise<Todo[]> => {
  const endpoint = (() => {
    if (database === DatabaseOptions.MongoDb) {
      return API_GET_TODO;
    }
    return API_SQL_GET_TODO;
  })();

  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`Failed to get todos: ${response.statusText}`);
  }

  return await response.json();
};

export const updateTodo = async (
  { _id, title, description, isFinished, dueDateUtc }: Partial<Todo>,
  database: DatabaseOptions = DatabaseOptions.MongoDb
): Promise<Todo> => {
  const endpoint = (() => {
    if (database === DatabaseOptions.MongoDb) {
      return API_PATCH_TODO;
    }
    return API_SQL_PATCH_TODO;
  })();

  const url = new URL(`${endpoint}/${_id}`);

  const updatedTodo = {
    title,
    description,
    isFinished,
    dueDateUtc,
  };

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedTodo),
  });

  if (!response.ok) {
    throw new Error(`Failed to update todo: ${response.statusText}`);
  }

  return await response.json();
};

export const deleteTodo = async (
  _id: string,
  database: DatabaseOptions = DatabaseOptions.MongoDb
): Promise<Todo> => {
  const endpoint = (() => {
    if (database === DatabaseOptions.MongoDb) {
      return API_DELETE_TODO;
    }
    return API_SQL_DELETE_TODO;
  })();

  const url = new URL(`${endpoint}/${_id}`);

  const response = await fetch(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete todo: ${response.statusText}`);
  }

  return response.json();
};
