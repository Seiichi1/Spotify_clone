import { usePlayer } from '../context/PlayerContext';
import { useCallback } from 'react';
import client from '../api/client';
import toast from 'react-hot-toast';

function fmt(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function Player() {
  const { currentSong, isPlaying, progress, duration, volume, isMuted, dispatch, seek } = usePlayer();

  const togglePlay = () => dispatch({ type: 'TOGGLE_PLAY' });
  const next = () => dispatch({ type: 'NEXT' });
  const prev = () => dispatch({ type: 'PREV' });

  const handleProgressClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seek(ratio * duration);
  }, [seek, duration]);

  const handleVolumeChange = (e) => {
    dispatch({ type: 'SET_VOLUME', value: parseFloat(e.target.value) });
  };

  const toggleLike = async () => {
    if (!currentSong) return;
    try {
      if (currentSong.is_liked) {
        await client.delete(`/library/like/${currentSong.id}`);
        toast.success('Removed from Liked Songs');
      } else {
        await client.post(`/library/like/${currentSong.id}`);
        toast.success('Added to Liked Songs');
      }
    } catch {
      toast.error('Could not update like');
    }
  };

  const fillPct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <footer className="player">
      {/* Left — song info */}
      <div className="player-song-info">
        {currentSong ? (
          <>
            {currentSong.album?.cover_url
              ? <img className="player-cover" src={currentSong.album.cover_url} alt="" />
              : <div className="player-cover-placeholder">♪</div>
            }
            <div className="player-song-text">
              <div className="player-song-title">{currentSong.title}</div>
              <div className="player-song-artist">{currentSong.artist?.name}</div>
            </div>
            <button
              className={`player-like-btn${currentSong.is_liked ? ' liked' : ''}`}
              onClick={toggleLike}
              title={currentSong.is_liked ? 'Unlike' : 'Like'}
            >
              {currentSong.is_liked ? '♥' : '♡'}
            </button>
          </>
        ) : (
          <div style={{ color: '#6a6a6a', fontSize: 13 }}>No song playing</div>
        )}
      </div>

      {/* Center — controls */}
      <div className="player-controls">
        <div className="player-buttons">
          <button className="player-btn" onClick={prev} title="Previous">⏮</button>
          <button className="player-play-btn" onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button className="player-btn" onClick={next} title="Next">⏭</button>
        </div>
        <div className="player-progress">
          <span className="player-time">{fmt(progress)}</span>
          <div className="progress-bar" onClick={handleProgressClick}>
            <div className="progress-fill" style={{ width: `${fillPct}%` }} />
          </div>
          <span className="player-time right">{fmt(duration)}</span>
        </div>
      </div>

      {/* Right — volume */}
      <div className="player-right">
        <div className="volume-control">
          <button
            className="volume-btn"
            onClick={() => dispatch({ type: 'TOGGLE_MUTE' })}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
          </button>
          <input
            type="range" min={0} max={1} step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            style={{ width: 80 }}
          />
        </div>
      </div>
    </footer>
  );
}
