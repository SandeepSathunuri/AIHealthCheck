// src/main.jsx or index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import ThemeProviderWrapper from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext'; // ✅ Make sure this is imported

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProviderWrapper>
      <BrowserRouter>
        <AuthProvider> 
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProviderWrapper>
  </React.StrictMode>
);
