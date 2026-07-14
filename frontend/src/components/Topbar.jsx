import { useNavigate, useLocation } from 'react-router-dom';

export default function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="topbar">
      <button className="topbar-nav-btn" onClick={() => navigate(-1)} title="Back">‹</button>
      <button className="topbar-nav-btn" onClick={() => navigate(1)} title="Forward">›</button>

      {location.pathname === '/search' && (
        <div className="topbar-search" style={{ flex: 1 }}>
          {/* Search input is in SearchPage itself */}
        </div>
      )}
      <div style={{ flex: 1 }} />
    </header>
  );
}
