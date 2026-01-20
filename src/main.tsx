import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { StyleProvider } from './contexts/StyleContext';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <StyleProvider>
          <App />
        </StyleProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
