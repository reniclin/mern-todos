import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Spinner from '../components/Spinner';
import { useState } from 'react';
import { API_GET_TODO } from '../config/api';

export default function Todos() {
  return (
    <div className='flex flex-col justify-start items-center gap-2 bg-zinc-100 w-screen h-screen'>
      <div className='flex justify-between items-center w-full p-2 border-b sticky top-0 bg-zinc-200'>
        <Link to={'/'} className='basic-button'>
          Back to Home
        </Link>
        <Link to={'/todos/add'} className='basic-button'>
          Add
        </Link>
      </div>
      <h1 className='font-mono text-lg'>Todo List</h1>
      <TodoList />
    </div>
  );
}

function TodoList() {
  const { data, error, isLoading, isError } = useQuery({
    queryKey: ['todos'],
    queryFn: () => getTodos(),
  });

  if (isError) {
    return <p>{error.message}</p>;
  }

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <>
      <ul className='flex flex-col justify-start items-start w-11/12'>
        {data != null &&
          data.map((todo: Todo) => {
            return <TodoElement key={todo._id} todo={todo} />;
          })}
      </ul>
    </>
  );
}

function TodoElement(props: { todo: Todo; children?: React.ReactNode }) {
  const {
    title,
    // _id,
    description,
    category,
    isFinished,
    createdAtUtc,
    updatedAtUtc,
    dueDateUtc,
  } = props.todo;

  const [isShowDetails, setIsShowDetails] = useState(false);
  const [finishedState, setFinishedState] = useState(isFinished);
  const [deletedState, setDeletedState] = useState(false);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFinishedState(event.target.checked);
  };

  return (
    <li
      className={`flex w-full border-b-gray-200 border-b py-4 ${
        deletedState && 'hidden'
      }`}
    >
      {isShowDetails ? (
        <div
          className='flex flex-col items-start justify-center'
          onClick={() => {
            setIsShowDetails((prev: boolean) => !prev);
          }}
        >
          <p className='font-bold'>{category}</p>
          <p>{title}</p>
          <p className='font-light'>{description}</p>
          {createdAtUtc != null && (
            <p className='font-extralight text-sm'>{`Create: ${new Date(
              createdAtUtc
            ).toLocaleString()}`}</p>
          )}
          {updatedAtUtc != null && (
            <p className='font-extralight text-sm'>{`Create: ${new Date(
              updatedAtUtc
            ).toLocaleString()}`}</p>
          )}
          {dueDateUtc != null && (
            <p className='font-extralight text-sm'>{`Due: ${new Date(
              dueDateUtc
            ).toLocaleString()}`}</p>
          )}
        </div>
      ) : (
        <div className='flex items-center gap-3 w-full'>
          <input
            type='checkbox'
            className='h-4 w-4 text-violet-500'
            checked={finishedState}
            onChange={handleCheckboxChange}
          />
          <p
            onClick={() => {
              setIsShowDetails((prev: boolean) => !prev);
            }}
            className={finishedState ? 'line-through text-gray-600' : ''}
          >
            {title}
          </p>
          <button
            onClick={() => setDeletedState(true)}
            className='basic-button ml-auto'
          >
            Delete
          </button>
        </div>
      )}
    </li>
  );
}

async function getTodos(): Promise<Todo[]> {
  const response = await fetch(API_GET_TODO);

  if (!response.ok) {
    throw new Error(`Failed to get todos: ${response.statusText}`);
  }

  return await response.json();
}
