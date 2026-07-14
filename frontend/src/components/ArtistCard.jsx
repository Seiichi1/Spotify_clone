import { useNavigate } from 'react-router-dom';

export default function ArtistCard({ artist }) {
  const navigate = useNavigate();

  return (
    <div className="card" onClick={() => navigate(`/artist/${artist.id}`)}>
      <div className="card-image-wrap">
        <img
          className="card-img round"
          src={artist.image_url || 'https://via.placeholder.com/160?text=Artist'}
          alt={artist.name}
        />
        <button className="card-play-btn" onClick={e => { e.stopPropagation(); navigate(`/artist/${artist.id}`); }} title="View">▶</button>
      </div>
      <div className="card-title">{artist.name}</div>
      <div className="card-sub">Artist</div>
    </div>
  );
}
