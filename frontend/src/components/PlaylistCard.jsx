import { useNavigate } from 'react-router-dom';

export default function PlaylistCard({ playlist }) {
  const navigate = useNavigate();

  return (
    <div className="card" onClick={() => navigate(`/playlist/${playlist.id}`)}>
      <div className="card-image-wrap">
        {playlist.cover_url
          ? <img className="card-img" src={playlist.cover_url} alt={playlist.name} />
          : <div className="card-img" style={{ background: 'linear-gradient(135deg,#1db954,#191414)', display:'flex',alignItems:'center',justifyContent:'center',fontSize:48 }}>♪</div>
        }
        <button className="card-play-btn" onClick={e => { e.stopPropagation(); navigate(`/playlist/${playlist.id}`); }} title="Open">▶</button>
      </div>
      <div className="card-title">{playlist.name}</div>
      <div className="card-sub">{playlist.songs?.length ?? 0} songs</div>
    </div>
  );
}
