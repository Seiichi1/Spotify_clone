import { useState, useCallback } from 'react';
import client from '../api/client';
import SongRow from '../components/SongRow';
import AlbumCard from '../components/AlbumCard';
import ArtistCard from '../components/ArtistCard';
import { useDebounce } from '../hooks/useDebounce';
import { useEffect } from 'react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults(null); return; }
    setLoading(true);
    client.get(`/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then(r => setResults(r.data))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  return (
    <div>
      <div className="search-hero">
        <h1>Search</h1>
        <div className="search-input-wrap">
          <span className="search-icon-big">🔍</span>
          <input
            id="search-input"
            className="search-input"
            placeholder="What do you want to listen to?"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      {loading && <div className="spinner" />}

      {results && !loading && (
        <>
          {results.songs.length > 0 && (
            <div className="section">
              <div className="section-title">Songs</div>
              <div className="song-list">
                <div className="song-list-header">
                  <span>#</span><span>Title</span><span>Album</span><span>Duration</span><span></span>
                </div>
                {results.songs.map((s, i) => (
                  <SongRow key={s.id} song={s} index={i} queue={results.songs} />
                ))}
              </div>
            </div>
          )}
          {results.artists.length > 0 && (
            <div className="section">
              <div className="section-title">Artists</div>
              <div className="cards-grid">
                {results.artists.map(a => <ArtistCard key={a.id} artist={a} />)}
              </div>
            </div>
          )}
          {results.albums.length > 0 && (
            <div className="section">
              <div className="section-title">Albums</div>
              <div className="cards-grid">
                {results.albums.map(a => <AlbumCard key={a.id} album={a} />)}
              </div>
            </div>
          )}
          {results.songs.length === 0 && results.artists.length === 0 && results.albums.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No results for "{query}"</h3>
              <p>Try different keywords</p>
            </div>
          )}
        </>
      )}

      {!query && (
        <div className="empty-state">
          <div className="empty-state-icon">🎵</div>
          <h3>Search for songs, artists, and albums</h3>
          <p>Type something above to get started</p>
        </div>
      )}
    </div>
  );
}
