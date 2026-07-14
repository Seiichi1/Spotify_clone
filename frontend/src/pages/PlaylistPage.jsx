import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';
import SongRow from '../components/SongRow';
import { usePlayer } from '../context/PlayerContext';
import toast from 'react-hot-toast';

export default function PlaylistPage() {
  const { id } = useParams();
  const { playSong } = usePlayer();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get(`/playlists/${id}`)
      .then(r => setPlaylist(r.data))
      .catch(() => toast.error('Playlist not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner" />;
  if (!playlist) return <div className="empty-state"><h3>Playlist not found</h3></div>;

  const songs = playlist.songs?.map(ps => ps.song) || [];

  const playAll = () => {
    if (songs.length) playSong(songs[0], songs, 0);
  };

  return (
    <div>
      <div className="page-hero" style={{ background: 'linear-gradient(135deg,#5038a0,#191414)' }}>
        <div style={{ width:220,height:220,borderRadius:8,background:'linear-gradient(135deg,#7c4dff,#1db954)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:80 }}>
          ♪
        </div>
        <div className="page-hero-info">
          <div className="page-hero-type">Playlist</div>
          <h1 className="page-hero-title">{playlist.name}</h1>
          {playlist.description && <p className="page-hero-sub">{playlist.description}</p>}
          <p className="page-hero-sub" style={{ marginTop: 8 }}>{songs.length} songs</p>
        </div>
      </div>

      {songs.length > 0 && (
        <button className="play-all-btn" onClick={playAll}>▶ Play All</button>
      )}

      {songs.length === 0
        ? <div className="empty-state"><div className="empty-state-icon">🎵</div><h3>This playlist is empty</h3><p>Search for songs and add them here.</p></div>
        : <div className="song-list">
            <div className="song-list-header"><span>#</span><span>Title</span><span>Album</span><span>Duration</span><span></span></div>
            {songs.map((s, i) => <SongRow key={s.id} song={s} index={i} queue={songs} />)}
          </div>
      }
    </div>
  );
}
