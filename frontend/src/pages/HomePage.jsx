import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import client from '../api/client';
import AlbumCard from '../components/AlbumCard';
import ArtistCard from '../components/ArtistCard';
import SongRow from '../components/SongRow';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomePage() {
  const { user } = useAuth();
  const { playSong } = usePlayer();
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      client.get('/songs?limit=10'),
      client.get('/albums?limit=8'),
      client.get('/artists?limit=8'),
      client.get('/recommendations'),
    ]).then(([s, al, ar, r]) => {
      setSongs(s.data);
      setAlbums(al.data);
      setArtists(ar.data);
      setRecs(r.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>
        {getGreeting()}{user ? `, ${user.username}` : ''}
      </h1>

      {/* Quick-access recent albums */}
      <div className="greeting-grid" style={{ marginBottom: 40 }}>
        {albums.slice(0, 6).map(al => (
          <div key={al.id} className="greeting-card">
            {al.cover_url
              ? <img src={al.cover_url} alt={al.title} />
              : <div className="greeting-card-placeholder">♪</div>
            }
            <span>{al.title}</span>
          </div>
        ))}
      </div>

      {/* Recommended songs */}
      {recs.length > 0 && (
        <div className="section">
          <div className="section-title">Recommended for you</div>
          <div className="song-list">
            <div className="song-list-header">
              <span>#</span><span>Title</span><span>Album</span><span>Duration</span><span></span>
            </div>
            {recs.slice(0, 8).map((s, i) => (
              <SongRow key={s.id} song={s} index={i} queue={recs} />
            ))}
          </div>
        </div>
      )}

      {/* Albums */}
      <div className="section">
        <div className="section-title">New Releases</div>
        <div className="cards-grid">
          {albums.map(al => <AlbumCard key={al.id} album={al} />)}
        </div>
      </div>

      {/* Artists */}
      <div className="section">
        <div className="section-title">Popular Artists</div>
        <div className="cards-grid">
          {artists.map(ar => <ArtistCard key={ar.id} artist={ar} />)}
        </div>
      </div>
    </div>
  );
}
