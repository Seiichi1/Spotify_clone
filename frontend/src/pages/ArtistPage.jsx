import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';
import SongRow from '../components/SongRow';
import AlbumCard from '../components/AlbumCard';
import { usePlayer } from '../context/PlayerContext';

export default function ArtistPage() {
  const { id } = useParams();
  const { playSong } = usePlayer();
  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      client.get(`/artists/${id}`),
      client.get(`/artists/${id}/songs`),
      client.get(`/artists/${id}/albums`),
    ]).then(([a, s, al]) => {
      setArtist(a.data);
      setSongs(s.data);
      setAlbums(al.data);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner" />;
  if (!artist) return <div className="empty-state"><h3>Artist not found</h3></div>;

  return (
    <div>
      {/* Hero */}
      <div style={{
        minHeight: 280, display:'flex', alignItems:'flex-end', gap:24,
        padding: '40px 32px 24px',
        background: `linear-gradient(to bottom, #333 0%, rgba(18,18,18,0) 100%)`,
        margin: '-24px -32px 24px',
        position: 'relative', overflow: 'hidden',
      }}>
        {artist.image_url && (
          <img src={artist.image_url} alt={artist.name} style={{ position:'absolute',top:0,left:0,width:'100%',height:'100%',objectFit:'cover',opacity:0.25 }} />
        )}
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8 }}>Artist</div>
          <h1 style={{ fontSize:52,fontWeight:900,lineHeight:1.1,marginBottom:8 }}>{artist.name}</h1>
          <p style={{ color:'#b3b3b3', fontSize:14 }}>{(artist.followers_count || 0).toLocaleString()} followers</p>
        </div>
      </div>

      {songs.length > 0 && (
        <button className="play-all-btn" onClick={() => playSong(songs[0], songs, 0)}>▶ Play</button>
      )}

      {/* Top songs */}
      <div className="section">
        <div className="section-title">Popular</div>
        <div className="song-list">
          <div className="song-list-header"><span>#</span><span>Title</span><span>Album</span><span>Duration</span><span></span></div>
          {songs.slice(0, 10).map((s, i) => <SongRow key={s.id} song={s} index={i} queue={songs} />)}
        </div>
      </div>

      {/* Albums */}
      {albums.length > 0 && (
        <div className="section">
          <div className="section-title">Albums</div>
          <div className="cards-grid">
            {albums.map(al => <AlbumCard key={al.id} album={al} />)}
          </div>
        </div>
      )}

      {artist.bio && (
        <div className="section">
          <div className="section-title">About</div>
          <p style={{ color:'#b3b3b3', lineHeight:1.7, maxWidth:600 }}>{artist.bio}</p>
        </div>
      )}
    </div>
  );
}
