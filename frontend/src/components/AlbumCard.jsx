import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';

export default function AlbumCard({ album }) {
  const navigate = useNavigate();
  const { playSong } = usePlayer();

  return (
    <div className="card" onClick={() => navigate(`/album/${album.id}`)}>
      <div className="card-image-wrap">
        <img
          className="card-img"
          src={album.cover_url || 'https://via.placeholder.com/160?text=Album'}
          alt={album.title}
        />
        <button
          className="card-play-btn"
          onClick={e => { e.stopPropagation(); /* songs loaded in AlbumPage */ navigate(`/album/${album.id}`); }}
          title="Play"
        >▶</button>
      </div>
      <div className="card-title">{album.title}</div>
      <div className="card-sub">{album.artist?.name} · {album.release_year}</div>
    </div>
  );
}
