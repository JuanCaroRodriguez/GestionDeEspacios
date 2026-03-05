import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import router from './routes/routes';

import './index.css';

const r = createBrowserRouter(router)

ReactDOM.createRoot(document.getElementById('root'))
  .render(
    <RouterProvider router={r} />
  );

