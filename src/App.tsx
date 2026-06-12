import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './Routes/AppRoutes';
import { ThemeProvider } from './components/ThemeContext';
import FloatingThemeToggle from './components/FloatingThemeToggle';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppRoutes />
        <FloatingThemeToggle />
      </ThemeProvider>
    </BrowserRouter>
  );
}
