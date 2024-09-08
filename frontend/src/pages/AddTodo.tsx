import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { ChangeEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { API_ADD_TODO } from '../config/api';

export default function AddTodo() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState(() =>
    new Date().toISOString().slice(0, 16)
  );

  const useCreateTodoMutation = (): UseMutationResult<
    Todo,
    Error,
    Todo,
    unknown
  > => {
    return useMutation<Todo, Error, Todo, unknown>({
      mutationFn: createTodo,
      onSuccess: (data: Todo) => {
        console.log('Todo created successfully:', data);
        navigate('/todos');
      },
      onError: (error: Error) => {
        console.error('Error creating todo:', error);
        navigate('/todos');
      },
    });
  };

  const createTodoMutation = useCreateTodoMutation();

  const handleCreateTodo = () => {
    createTodoMutation.mutate({
      title,
      description,
      category,
      dueDateUtc: new Date(dueDate).toISOString(),
      isFinished: false,
    });
  };

  const handleCategoryChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCategory(event.target.value);
  };

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
  };

  const handleDateTimeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDueDate(event.target.value);
  };

  return (
    <div className='flex flex-col justify-start items-center gap-2 bg-zinc-100 w-screen h-screen'>
      <div className='flex justify-between items-center w-full p-2 border-b sticky top-0 bg-zinc-200'>
        <Link to={'/todos'} className='basic-button'>
          Cancel
        </Link>
        <button className='basic-button' onClick={handleCreateTodo}>
          Create
        </button>
      </div>
      <h1 className='font-mono text-lg'>Create new Todo</h1>

      <div className='flex flex-col justify-start items-center w-11/12'>
        <div className='flex w-full gap-4 py-2'>
          <label htmlFor='category'>Category: </label>
          <input
            className='flex-grow'
            type='text'
            id='category'
            value={category}
            onChange={handleCategoryChange}
          />
        </div>
      </div>

      <div className='flex flex-col justify-start items-center w-11/12'>
        <div className='flex w-full gap-4 py-2'>
          <label htmlFor='title'>Title: </label>
          <input
            className='flex-grow'
            type='text'
            id='title'
            value={title}
            onChange={handleTitleChange}
          />
        </div>

        <div className='flex w-full gap-4 py-2'>
          <label htmlFor='description'>Description: </label>
          <input
            className='flex-grow'
            type='text'
            id='description'
            value={description}
            onChange={handleDescriptionChange}
          />
        </div>

        <div className='flex w-full gap-4 py-2'>
          <label htmlFor='due-date'>Due Date: </label>
          <input
            className='flex-grow'
            type='datetime-local'
            id='due-date'
            value={dueDate}
            onChange={handleDateTimeChange}
          />
        </div>
      </div>
    </div>
  );
}

async function createTodo(todo: Todo): Promise<Todo> {
  const response = await fetch(API_ADD_TODO, {
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
}
