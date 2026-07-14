import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PlayerProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#282828', color: '#fff', border: '1px solid #3a3a3a' },
              success: { iconTheme: { primary: '#1db954', secondary: '#000' } },
            }}
          />
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
