import { usePlayer } from '../context/PlayerContext';
import client from '../api/client';
import toast from 'react-hot-toast';

function fmt(sec) {
  if (!sec) return '--:--';
  return `${Math.floor(sec / 60)}:${Math.floor(sec % 60).toString().padStart(2, '0')}`;
}

export default function SongRow({ song, index, queue = [], showAlbum = true }) {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const isCurrentSong = currentSong?.id === song.id;

  const handlePlay = () => playSong(song, queue.length ? queue : [song], index);

  const toggleLike = async (e) => {
    e.stopPropagation();
    try {
      if (song.is_liked) {
        await client.delete(`/library/like/${song.id}`);
        toast.success('Removed from Liked Songs');
      } else {
        await client.post(`/library/like/${song.id}`);
        toast.success('Added to Liked Songs');
      }
    } catch {
      toast.error('Could not update like');
    }
  };

  return (
    <div className={`song-row${isCurrentSong ? ' playing' : ''}`} onClick={handlePlay}>
      <div className="song-num">
        {isCurrentSong && isPlaying ? '▶' : index + 1}
      </div>
      <div className="song-info">
        {song.album?.cover_url && (
          <img className="song-cover" src={song.album.cover_url} alt="" />
        )}
        <div>
          <div className="song-title-text">{song.title}</div>
          <div className="song-artist-text">{song.artist?.name}</div>
        </div>
      </div>
      {showAlbum && (
        <div className="song-album-text">{song.album?.title || '—'}</div>
      )}
      <div className="song-duration">{fmt(song.duration_sec)}</div>
      <button
        className={`like-btn${song.is_liked ? ' liked' : ''}`}
        onClick={toggleLike}
        title={song.is_liked ? 'Unlike' : 'Like'}
      >
        {song.is_liked ? '♥' : '♡'}
      </button>
    </div>
  );
}
