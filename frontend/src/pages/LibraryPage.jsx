import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import SongRow from '../components/SongRow';
import PlaylistCard from '../components/PlaylistCard';
import toast from 'react-hot-toast';

export default function LibraryPage() {
  const navigate = useNavigate();
  const [likedSongs, setLikedSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState('liked');
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    Promise.all([
      client.get('/library/liked'),
      client.get('/playlists'),
      client.get('/library/history'),
    ]).then(([l, p, h]) => {
      setLikedSongs(l.data);
      setPlaylists(p.data);
      setHistory(h.data);
    }).finally(() => setLoading(false));
  }, []);

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const { data } = await client.post('/playlists', { name: newName });
      setPlaylists(p => [...p, data]);
      setNewName('');
      toast.success('Playlist created!');
      navigate(`/playlist/${data.id}`);
    } catch { toast.error('Could not create playlist'); }
    finally { setCreating(false); }
  };

  if (loading) return <div className="spinner" />;

  const tabs = [
    { id: 'liked', label: `Liked Songs (${likedSongs.length})` },
    { id: 'playlists', label: `Playlists (${playlists.length})` },
    { id: 'history', label: 'Recently Played' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Your Library</h1>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: '8px 16px', borderRadius: 9999, fontSize: 14, fontWeight: 600,
              background: tab === t.id ? '#fff' : '#282828',
              color: tab === t.id ? '#000' : '#b3b3b3',
              transition: 'all 0.2s',
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* Liked songs */}
      {tab === 'liked' && (
        likedSongs.length === 0
          ? <div className="empty-state"><div className="empty-state-icon">♥</div><h3>No liked songs yet</h3><p>Click the heart on any song to save it here.</p></div>
          : <div className="song-list">
              <div className="song-list-header"><span>#</span><span>Title</span><span>Album</span><span>Duration</span><span></span></div>
              {likedSongs.map((s, i) => <SongRow key={s.id} song={s} index={i} queue={likedSongs} />)}
            </div>
      )}

      {/* Playlists */}
      {tab === 'playlists' && (
        <>
          <form onSubmit={createPlaylist} style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <input className="form-input" style={{ maxWidth: 300 }} placeholder="New playlist name…"
              value={newName} onChange={e => setNewName(e.target.value)} />
            <button className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }} disabled={creating}>
              {creating ? '...' : 'Create'}
            </button>
          </form>
          {playlists.length === 0
            ? <div className="empty-state"><div className="empty-state-icon">🎵</div><h3>No playlists yet</h3><p>Create one above.</p></div>
            : <div className="cards-grid">{playlists.map(p => <PlaylistCard key={p.id} playlist={p} />)}</div>
          }
        </>
      )}

      {/* History */}
      {tab === 'history' && (
        history.length === 0
          ? <div className="empty-state"><div className="empty-state-icon">⏱</div><h3>No listening history</h3><p>Play some songs first.</p></div>
          : <div className="song-list">
              <div className="song-list-header"><span>#</span><span>Title</span><span>Album</span><span>Duration</span><span></span></div>
              {history.map((s, i) => <SongRow key={s.id} song={s} index={i} queue={history} />)}
            </div>
      )}
    </div>
  );
}
