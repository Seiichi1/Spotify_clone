import { createContext, useContext, useReducer, useRef, useEffect, useCallback } from 'react';
import client from '../api/client';

const PlayerContext = createContext(null);

const initialState = {
  currentSong: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  progress: 0,       // seconds elapsed
  duration: 0,       // total seconds
  volume: 0.8,
  isMuted: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'PLAY_SONG':
      return { ...state, currentSong: action.song, queue: action.queue || state.queue, queueIndex: action.index ?? 0, isPlaying: true, progress: 0 };
    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.value };
    case 'SET_PROGRESS':
      return { ...state, progress: action.value };
    case 'SET_DURATION':
      return { ...state, duration: action.value };
    case 'SET_VOLUME':
      return { ...state, volume: action.value, isMuted: false };
    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted };
    case 'NEXT': {
      const next = state.queueIndex + 1;
      if (next >= state.queue.length) return state;
      return { ...state, currentSong: state.queue[next], queueIndex: next, isPlaying: true, progress: 0 };
    }
    case 'PREV': {
      if (state.progress > 3) return { ...state, progress: 0 };
      const prev = Math.max(0, state.queueIndex - 1);
      return { ...state, currentSong: state.queue[prev], queueIndex: prev, isPlaying: true, progress: 0 };
    }
    case 'SET_QUEUE':
      return { ...state, queue: action.queue };
    default:
      return state;
  }
}

export function PlayerProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const audioRef = useRef(new Audio());

  // Sync audio src when song changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!state.currentSong) return;
    audio.src = state.currentSong.audio_url;
    audio.volume = state.isMuted ? 0 : state.volume;
    audio.play().catch(() => {});

    audio.ontimeupdate = () => dispatch({ type: 'SET_PROGRESS', value: audio.currentTime });
    audio.ondurationchange = () => dispatch({ type: 'SET_DURATION', value: audio.duration || 0 });
    audio.onended = () => dispatch({ type: 'NEXT' });

    // Record play in backend
    if (state.currentSong.id) {
      client.post(`/songs/${state.currentSong.id}/play`).catch(() => {});
    }

    return () => { audio.ontimeupdate = null; audio.ondurationchange = null; audio.onended = null; };
  }, [state.currentSong]);

  // Sync play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (state.isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [state.isPlaying]);

  // Sync volume
  useEffect(() => {
    audioRef.current.volume = state.isMuted ? 0 : state.volume;
  }, [state.volume, state.isMuted]);

  const playSong = useCallback((song, queue = [], index = 0) => {
    dispatch({ type: 'PLAY_SONG', song, queue, index });
  }, []);

  const seek = useCallback((seconds) => {
    audioRef.current.currentTime = seconds;
    dispatch({ type: 'SET_PROGRESS', value: seconds });
  }, []);

  return (
    <PlayerContext.Provider value={{ ...state, dispatch, playSong, seek }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);
