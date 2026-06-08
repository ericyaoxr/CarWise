import { createBrowserRouter } from 'react-router-dom';
import { AppContent } from './App';

export const router = createBrowserRouter([
  {
    path: '/*',
    element: <AppContent />,
  },
]);
