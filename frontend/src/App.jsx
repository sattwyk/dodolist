import Todo from './components/Todo';
import { useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function App() {
  const inputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: todos, isLoading, error } = useQuery(['todos'], getTodos);

  async function getTodos() {
    const res = await fetch('/api/todo');
    const data = await res.json();
    return data;
  }

  const mutation = useMutation(postTodo, {
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries(['todos']);
      const previousTodos = queryClient.getQueryData(['todos']);
      queryClient.setQueryData(['todos'], [...previousTodos, newTodo]);
      inputRef.current.value = '';
      return { previousTodos };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['todos'], context.previousTodos);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['todos']);
    },
  });

  function postTodo({ title }) {
    return fetch('/api/todo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    }).then((res) => res.json());
  }

  function handleClick() {
    const title = inputRef.current.value.trim();
    if (!title) return;
    const newTodo = {
      title,
      completed: false,
      id: todos[todos.length - 1].id + 1,
    };
    mutation.mutate(newTodo);
  }

  return (
    <>
      <main className='h-screen bg-slate-950'>
        <h1 className='font-mono text-center font-extrabold text-white text-3xl'>
          Dodolist
        </h1>

        <div className='flex justify-center items-center mt-5 gap-2'>
          <input
            ref={inputRef}
            className='rounded-md h-10 w-52 p-2'
            type='text'
          />
          <button
            onClick={handleClick}
            disabled={mutation.isLoading}
            className='p-2 rounded-md text-rose-950 w-16 bg-rose-400'
          >
            Add
          </button>
        </div>

        {isLoading ? (
          <h1 className='text-center mt-3 text-white text-2xl'>Loading...</h1>
        ) : (
          <ul className='container mx-auto'>
            {todos.map(({ title, completed, id }) => (
              <Todo
                key={`todo#${id}`}
                todo={title}
                completed={completed}
                id={id}
              />
            ))}
          </ul>
        )}

        {error && (
          <h1 className='text-center text-2xl text-red-700'>
            Something went wrong
          </h1>
        )}
      </main>
    </>
  );
}

export default App;
