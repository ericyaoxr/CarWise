import { createBrowserRouter } from 'react-router-dom';
import { AppContent } from './App';

// 先保持简单，继续使用 App 的内部路由逻辑
export const router = createBrowserRouter([
  {
    path: '/*',
    element: <AppContent />,
  },
]);
