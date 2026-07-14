import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import client from '../api/client';

const HomeIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 20v-5h-2v5H5v-9H2L12 2l10 9h-3v9z"/>
  </svg>
);
const SearchIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);
const LibraryIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/>
  </svg>
);

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    client.get('/playlists').then(r => setPlaylists(r.data)).catch(() => {});
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <span>Spoti<em style={{ color: '#1db954', fontStyle: 'normal' }}>fy</em></span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
          <HomeIcon /> Home
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => isActive ? 'active' : ''}>
          <SearchIcon /> Search
        </NavLink>
        <NavLink to="/library" className={({ isActive }) => isActive ? 'active' : ''}>
          <LibraryIcon /> Your Library
        </NavLink>
      </nav>

      <div className="sidebar-divider" />

      <div className="sidebar-library">
        <div className="sidebar-library-header">
          <span>Playlists</span>
        </div>
        {playlists.map(pl => (
          <div
            key={pl.id}
            className="sidebar-playlist-item"
            onClick={() => navigate(`/playlist/${pl.id}`)}
          >
            {pl.name}
          </div>
        ))}
        {playlists.length === 0 && (
          <div className="sidebar-playlist-item" style={{ color: '#6a6a6a', fontSize: 12 }}>
            No playlists yet
          </div>
        )}
      </div>

      {user && (
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="sidebar-username">{user.username}</span>
          <button className="sidebar-logout" onClick={logout}>Log out</button>
        </div>
      )}
    </aside>
  );
}
