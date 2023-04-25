import PropTypes from 'prop-types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_DOMAIN } from '../../config';
export default function Todo({ todo, id, completed }) {
  const queryClient = useQueryClient();

  function deleteTodo() {
    return fetch(`${API_DOMAIN}/api/todo/${id}`, {
      method: 'DELETE',
    }).then((res) => res.json());
  }

  function updateTodo() {
    return fetch(`${API_DOMAIN}/api/todo/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completed: !completed }),
    }).then((res) => res.json());
  }

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onMutate: async () => {
      await queryClient.cancelQueries(['todos']);
      const previousTodos = queryClient.getQueryData(['todos']);

      const filteredTodos = previousTodos.filter((todo) => todo.id !== id);

      queryClient.setQueryData(['todos'], filteredTodos);

      return { previousTodos };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['todos'], context.previousTodos);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['todos']);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateTodo,
    onMutate: async () => {
      await queryClient.cancelQueries(['todos']);
      const previousTodos = queryClient.getQueryData(['todos']);

      const updatedTodos = previousTodos.map((todo) => {
        if (todo.id === id) {
          return { ...todo, completed: !todo.completed };
        }
        return todo;
      });

      queryClient.setQueryData(['todos'], updatedTodos);

      return { previousTodos };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['todos'], context.previousTodos);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['todos']);
    },
  });

  return (
    <li className='text-center flex items-center justify-center gap-2 text-white font-semibold mt-2 mb-2'>
      <input
        className='accent-purple-700'
        type='radio'
        checked={completed}
        onClick={() => updateMutation.mutate()}
        readOnly
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
  id: PropTypes.number.isRequired,
  completed: PropTypes.bool.isRequired,
};
