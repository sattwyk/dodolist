import PropTypes from 'prop-types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function Todo({ todo, id, completed }) {
  const queryClient = useQueryClient();

  function deleteTodo() {
    return fetch(`http://localhost:5000/api/todo/${id}`, {
      method: 'DELETE',
    }).then((res) => res.json());
  }

  function updateTodo() {
    return fetch(`http://localhost:5000/api/todo/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completed: !completed }),
    }).then((res) => res.json());
  }

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  return (
    <li className='text-center flex items-center justify-center gap-2 text-white font-semibold mt-2 mb-2'>
      <input
        className='accent-purple-700'
        type='radio'
        checked={completed}
        onClick={() => updateMutation.mutate()}
      />
      <span>{todo}</span>
      <button
        className='bg-red-400 p-2 h-5 w-5 flex text-center justify-center items-center rounded-full hover:bg-red-800'
        onClick={() => deleteMutation.mutate()}
      >
        x
      </button>
    </li>
  );
}

Todo.propTypes = {
  todo: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  completed: PropTypes.bool.isRequired,
};
