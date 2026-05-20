import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './Routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
