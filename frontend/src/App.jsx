import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Player from './components/Player';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import LibraryPage from './pages/LibraryPage';
import PlaylistPage from './pages/PlaylistPage';
import ArtistPage from './pages/ArtistPage';
import AlbumPage from './pages/AlbumPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppShell({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Topbar />
        <div className="page-content">{children}</div>
      </div>
      <Player />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={
        <PrivateRoute>
          <AppShell><HomePage /></AppShell>
        </PrivateRoute>
      }/>
      <Route path="/search" element={
        <PrivateRoute>
          <AppShell><SearchPage /></AppShell>
        </PrivateRoute>
      }/>
      <Route path="/library" element={
        <PrivateRoute>
          <AppShell><LibraryPage /></AppShell>
        </PrivateRoute>
      }/>
      <Route path="/playlist/:id" element={
        <PrivateRoute>
          <AppShell><PlaylistPage /></AppShell>
        </PrivateRoute>
      }/>
      <Route path="/artist/:id" element={
        <PrivateRoute>
          <AppShell><ArtistPage /></AppShell>
        </PrivateRoute>
      }/>
      <Route path="/album/:id" element={
        <PrivateRoute>
          <AppShell><AlbumPage /></AppShell>
        </PrivateRoute>
      }/>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
