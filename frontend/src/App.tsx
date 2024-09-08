import { Routes, Route } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import Home from './pages/Home';
import Todos from './pages/Todos';

import './App.css';
import AddTodo from './pages/AddTodo';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/todos' element={<Todos />} />
        <Route path='/todos/add' element={<AddTodo />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
