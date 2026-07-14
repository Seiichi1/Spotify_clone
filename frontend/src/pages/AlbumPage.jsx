import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import SongRow from '../components/SongRow';
import { usePlayer } from '../context/PlayerContext';

export default function AlbumPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSong } = usePlayer();
  const [album, setAlbum] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      client.get(`/albums/${id}`),
      client.get(`/albums/${id}/songs`),
    ]).then(([a, s]) => {
      setAlbum(a.data);
      setSongs(s.data);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner" />;
  if (!album) return <div className="empty-state"><h3>Album not found</h3></div>;

  return (
    <div>
      {/* Hero */}
      <div className="page-hero" style={{ background: 'linear-gradient(135deg,#333,#191414)' }}>
        <img
          className="page-hero-img"
          src={album.cover_url || 'https://via.placeholder.com/220?text=Album'}
          alt={album.title}
        />
        <div className="page-hero-info">
          <div className="page-hero-type">Album</div>
          <h1 className="page-hero-title">{album.title}</h1>
          <p className="page-hero-sub">
            <span
              style={{ cursor:'pointer', fontWeight:600, color:'#fff' }}
              onClick={() => navigate(`/artist/${album.artist?.id}`)}
            >
              {album.artist?.name}
            </span>
            {album.release_year && <> · {album.release_year}</>}
            {album.genre && <> · {album.genre}</>}
            <> · {songs.length} songs</>
          </p>
        </div>
      </div>

      {songs.length > 0 && (
        <button className="play-all-btn" onClick={() => playSong(songs[0], songs, 0)}>▶ Play All</button>
      )}

      <div className="song-list">
        <div className="song-list-header"><span>#</span><span>Title</span><span>Album</span><span>Duration</span><span></span></div>
        {songs.map((s, i) => <SongRow key={s.id} song={s} index={i} queue={songs} showAlbum={false} />)}
      </div>
    </div>
  );
}
