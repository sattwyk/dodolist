import Todo from './components/Todo';
import { useRef, memo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function App() {
  const inputRef = useRef(null);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryFn: getTodos,
    queryKey: ['todos'],
  });

  function getTodos() {
    return fetch('http://localhost:5000/api/todo').then((res) => res.json());
  }

  function postTodo() {
    return fetch('http://localhost:5000/api/todo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: inputRef.current.value }),
    }).then((res) => res.json());
  }

  const mutation = useMutation({
    mutationFn: postTodo,
    onSuccess: () => {
      inputRef.current.value = '';
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  function handleClick() {
    if (!inputRef.current.value) return;
    mutation.mutate();
  }

  const MemoizedTodo = memo(Todo);

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
            d
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
        <div>
          {isLoading ? (
            <h1 className='text-center mt-3 text-white text-2xl'>Loading...</h1>
          ) : (
            <ul className='container mx-auto'>
              {data?.map(({ title, completed, id }) => (
                <MemoizedTodo
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
              something went wrong
            </h1>
          )}
        </div>
      </main>
    </>
  );
}

export default App;
