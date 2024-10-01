import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Spinner from '../components/Spinner';
import { useState } from 'react';
import {
  DatabaseOptions,
  deleteTodo,
  getTodoList,
  updateTodo,
} from '../utilities/todoApi';
import {
  localDatetimeStringToUtcString,
  utcStringTolocalDateTimeString,
} from '../utilities/localUtcHelper';

export default function Todos() {
  return (
    <div className='flex flex-col justify-start items-center gap-2 bg-zinc-100 w-screen h-screen'>
      <div className='flex justify-between items-center w-full p-2 border-b sticky top-0 bg-zinc-200'>
        <Link to={'/'} className='blue-button'>
          Back to Home
        </Link>
        <Link to={'/todos/add'} className='blue-button'>
          Add
        </Link>
      </div>
      <h1 className='font-mono text-lg'>Todo List</h1>
      <TodoList />
    </div>
  );
}

function TodoList() {
  const {
    data: mongoData,
    error: mongoError,
    isLoading: isMongoLoading,
    isError: isMongoError,
  } = useQuery({
    queryKey: ['todos', 'mongo'],
    queryFn: () => getTodoList(DatabaseOptions.MongoDb),
  });

  const {
    data: postgresData,
    error: postgresError,
    isLoading: isPostgresLoading,
    isError: isPostgresError,
  } = useQuery({
    queryKey: ['todos', 'postgres'],
    queryFn: () => getTodoList(DatabaseOptions.PostgreSql),
  });

  if (isMongoError) {
    return <p>{mongoError.message}</p>;
  }
  if (isPostgresError) {
    return <p>{postgresError.message}</p>;
  }

  if (isMongoLoading || isPostgresLoading) {
    return <Spinner />;
  }

  return (
    <>
      <ul className='flex flex-col justify-start items-start w-11/12'>
        {mongoData != null &&
          mongoData.map((todo: Todo) => (
            <TodoElement
              key={todo._id}
              database={DatabaseOptions.MongoDb}
              todo={todo}
            />
          ))}
        {postgresData != null &&
          postgresData.map((todo: Todo) => (
            <TodoElement
              key={todo._id}
              database={DatabaseOptions.PostgreSql}
              todo={todo}
            />
          ))}
      </ul>
    </>
  );
}

function TodoElement(props: {
  todo: Todo;
  database: DatabaseOptions;
  children?: React.ReactNode;
}) {
  const {
    _id,
    title,
    description,
    category,
    isFinished,
    createdAtUtc,
    updatedAtUtc,
    dueDateUtc,
  } = props.todo;

  const [isShowDetails, setIsShowDetails] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTitle, setEditingTitle] = useState(title);
  const [editingDescription, setEditingDescription] = useState(description);
  const [editingCategory, setEditingCategory] = useState(category);
  const [editingDueDate, setEditingDueDate] = useState(() =>
    utcStringTolocalDateTimeString(dueDateUtc)
  );

  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: async ({
      todo,
      database,
    }: {
      todo: Todo;
      database: DatabaseOptions;
    }) => {
      return await updateTodo(todo, database);
    },
    onSuccess: (data, variables, context) => {
      console.log(
        `update succeeded, data: ${JSON.stringify(
          data
        )}, variables: ${JSON.stringify(variables)}, context: ${JSON.stringify(
          context
        )}`
      );

      queryClient.invalidateQueries({
        queryKey: ['todos'],
        // exact: true,
      });
    },
    onError: (error, variables, context) => {
      console.log(
        `update failed, error: ${JSON.stringify(
          error
        )}, variables: ${JSON.stringify(variables)}, context: ${JSON.stringify(
          context
        )}`
      );
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async ({
      _id,
      database,
    }: {
      _id: string;
      database: DatabaseOptions;
    }) => {
      return await deleteTodo(_id, database);
    },
    onSuccess: (data, variables, context) => {
      console.log(
        `delete succeeded, data: ${data}, variables: ${variables}, context: ${context}`
      );

      queryClient.invalidateQueries({
        queryKey: ['todos'],
        // exact: true,
      });
    },
    onError: (error, variables, context) => {
      console.log(
        `delete failed, error: ${error}, variables: ${variables}, context: ${context}`
      );
    },
  });

  const handleCheckboxClicked = (event: React.MouseEvent<HTMLInputElement>) => {
    event.stopPropagation();
    updateMutation.mutate({
      todo: {
        _id,
        title,
        description,
        category,
        isFinished: !isFinished,
        dueDateUtc: localDatetimeStringToUtcString(editingDueDate),
      },
      database: props.database,
    });
  };

  const handleUpdateTodo = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    updateMutation.mutate({
      todo: {
        _id,
        title: editingTitle,
        description: editingDescription,
        category: editingCategory,
        isFinished,
        dueDateUtc: localDatetimeStringToUtcString(editingDueDate),
      },
      database: props.database,
    });

    setIsEditMode((prev) => !prev);
  };

  const handleDeleteTodo = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (_id != null) {
      deleteMutation.mutate({ _id, database: props.database });
    }

    setIsEditMode((prev) => !prev);
  };

  return (
    <li
      className={`flex w-full border-b-gray-200 border-b py-4`}
      onClick={() => {
        if (!isEditMode) {
          setIsShowDetails((prev: boolean) => !prev);
        }
      }}
    >
      {isShowDetails ? (
        <div className='flex flex-col items-start justify-center'>
          {isEditMode ? (
            <input
              className='w-full'
              type='text'
              value={editingCategory}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setEditingCategory(event.target.value);
              }}
            />
          ) : (
            <p className='font-black'>{category}</p>
          )}

          {isEditMode ? (
            <input
              className='w-full'
              type='text'
              value={editingTitle}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setEditingTitle(event.target.value);
              }}
            />
          ) : (
            <p className='font-extrabold'>{title}</p>
          )}

          {isEditMode ? (
            <input
              className='w-full'
              type='text'
              value={editingDescription}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setEditingDescription(event.target.value);
              }}
            />
          ) : (
            <p className='font-medium'>{description}</p>
          )}

          <div className='flex items-center justify-start gap-2'>
            <p className='font-medium'>{'Due Day:'}</p>
            {isEditMode ? (
              <input
                type='datetime-local'
                value={editingDueDate}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setEditingDueDate(event.target.value);
                }}
              />
            ) : dueDateUtc != null ? (
              <p className='font-light'>{`${new Date(
                dueDateUtc
              ).toLocaleString()}`}</p>
            ) : (
              <p className='font-light'>{'None'}</p>
            )}
          </div>

          {createdAtUtc != null && (
            <p className='font-extralight text-xs'>{`Created At: ${new Date(
              createdAtUtc
            ).toLocaleString()}`}</p>
          )}
          {updatedAtUtc != null && (
            <p className='font-extralight text-xs'>{`Updated At: ${new Date(
              updatedAtUtc
            ).toLocaleString()}`}</p>
          )}

          <p className='font-extralight text-xs'>{`Database: ${props.database}`}</p>

          {isEditMode ? (
            <div className='flex flex-row items-center justify-start gap-3'>
              <button
                className='blue-button mt-3 mr-auto'
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  setIsEditMode((prev) => !prev);
                }}
              >
                Cacel
              </button>
              <button
                className='red-button mt-3 ml-auto'
                onClick={handleUpdateTodo}
              >
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                setIsEditMode((prev) => !prev);
              }}
              className='basic-button mt-3 mr-auto'
            >
              Edit
            </button>
          )}
        </div>
      ) : (
        <div className='flex items-center gap-3 w-full'>
          <input
            type='checkbox'
            className='h-4 w-4 text-violet-500'
            defaultChecked={isFinished}
            onClick={handleCheckboxClicked}
          />
          <p className={isFinished ? 'line-through text-gray-600' : ''}>
            {title}
          </p>
          <button onClick={handleDeleteTodo} className='red-button ml-auto'>
            Delete
          </button>
        </div>
      )}
    </li>
  );
}
