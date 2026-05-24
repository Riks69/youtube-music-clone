import React, { useState, useEffect } from 'react';
import './App.css';

// API võti - asenda oma päris võtmega
const API_KEY = 'AIzaSyB-M9xN4bnzn1HwfmUzRReegpHYP4eV4y8';
const API_URL = 'https://www.googleapis.com/youtube/v3';

function App() {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);

  // Laadi populaarsed muusikavideod
  const loadPopularMusic = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/videos?part=snippet,statistics&chart=mostPopular&videoCategoryId=10&maxResults=20&regionCode=EE&key=${API_KEY}`
      );
      const data = await response.json();
      setSongs(data.items || []);
      if (data.items && data.items[0]) {
        setCurrentSong(data.items[0]);
      }
    } catch (error) {
      console.error('Viga:', error);
    } finally {
      setLoading(false);
    }
  };

  // Otsi laule
  const searchSongs = async (query) => {
    if (!query.trim()) {
      loadPopularMusic();
      return;
    }
    
    setLoading(true);
    try {
      const searchResponse = await fetch(
        `${API_URL}/search?part=snippet&maxResults=20&q=${query}&type=video&videoCategoryId=10&key=${API_KEY}`
      );
      const searchData = await searchResponse.json();
      
      const videoIds = searchData.items.map(item => item.id.videoId).join(',');
      const statsResponse = await fetch(
        `${API_URL}/videos?part=statistics&id=${videoIds}&key=${API_KEY}`
      );
      const statsData = await statsResponse.json();
      
      const songsWithStats = searchData.items.map(song => {
        const stats = statsData.items.find(s => s.id === song.id.videoId);
        return {
          ...song,
          statistics: stats?.statistics || { viewCount: 0 }
        };
      });
      
      setSongs(songsWithStats);
      if (songsWithStats[0]) setCurrentSong(songsWithStats[0]);
    } catch (error) {
      console.error('Otsingu viga:', error);
    } finally {
      setLoading(false);
    }
  };

  // Lisa esitusloendisse
  const addToPlaylist = (song) => {
    if (!playlist.find(s => s.id === song.id)) {
      setPlaylist([...playlist, song]);
    }
  };

  // Meeldimine
  const toggleLike = (song) => {
    if (likedSongs.find(s => s.id === song.id)) {
      setLikedSongs(likedSongs.filter(s => s.id !== song.id));
    } else {
      setLikedSongs([...likedSongs, song]);
    }
  };

  useEffect(() => {
    loadPopularMusic();
  }, []);

  const formatViews = (views) => {
    if (!views) return '0';
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views;
  };

  const categories = [
    { name: '🎵 Populaarsed', query: '' },
    { name: '🇪🇪 Eesti muusika', query: 'eesti muusika' },
    { name: '🔥 Pop', query: 'pop music' },
    { name: '🎸 Rock', query: 'rock music' },
    { name: '🕺 Hiphop', query: 'hiphop' },
    { name: '🎧 EDM', query: 'electronic dance music' },
    { name: '🎤 90ndad', query: '90s music' }
  ];

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <span className="logo-icon">🎵</span>
          <span className="logo-text">YouTube<span className="clone-text">Music</span></span>
        </div>
        
        <div className="search-bar">
          <input
            type="text"
            placeholder="Otsi laulu, artisti..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchSongs(searchQuery)}
          />
          <button onClick={() => searchSongs(searchQuery)}>🔍</button>
        </div>
        
        <div className="header-icons">
          <button className="icon-btn" onClick={() => setPlaylist([])}>
            📋 {playlist.length}
          </button>
          <button className="icon-btn">❤️ {likedSongs.length}</button>
          <div className="avatar">👤</div>
        </div>
      </header>

      {/* Kategooriad */}
      <div className="categories">
        {categories.map((cat, index) => (
          <button
            key={index}
            className="category-btn"
            onClick={() => searchSongs(cat.query)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Põhisisu */}
      <div className="main">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Laadin muusikat...</p>
          </div>
        ) : (
          <>
            {/* Pleier */}
            {currentSong && (
              <div className="player-section">
                <div className="player-container">
                  <iframe
                    className="player"
                    src={`https://www.youtube.com/embed/${currentSong.id?.videoId || currentSong.id}?autoplay=1`}
                    title="YouTube player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="player-info">
                  <h2>{currentSong.snippet?.title}</h2>
                  <p className="artist">{currentSong.snippet?.channelTitle}</p>
                  <div className="player-actions">
                    <button 
                      className="action-btn"
                      onClick={() => addToPlaylist(currentSong)}
                    >
                      ➕ Lisa esitusloendisse
                    </button>
                    <button 
                      className={`action-btn ${likedSongs.find(s => s.id === currentSong.id) ? 'liked' : ''}`}
                      onClick={() => toggleLike(currentSong)}
                    >
                      {likedSongs.find(s => s.id === currentSong.id) ? '❤️ Meeldib' : '♡ Meeldimine'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Laulude nimekiri */}
            <div className="songs-section">
              <h3>🎧 Populaarsed lood Eestis</h3>
              <div className="songs-list">
                {songs.map((song) => {
                  const songId = song.id?.videoId || song.id;
                  const isLiked = likedSongs.find(s => s.id === songId);
                  
                  return (
                    <div
                      key={songId}
                      className={`song-item ${currentSong?.id?.videoId === songId || currentSong?.id === songId ? 'active' : ''}`}
                      onClick={() => setCurrentSong(song)}
                    >
                      <img
                        src={song.snippet?.thumbnails?.default?.url}
                        alt={song.snippet?.title}
                        className="song-thumbnail"
                      />
                      <div className="song-info">
                        <div className="song-title">{song.snippet?.title}</div>
                        <div className="song-artist">{song.snippet?.channelTitle}</div>
                      </div>
                      <div className="song-views">{formatViews(song.statistics?.viewCount)}</div>
                      <button 
                        className="song-like-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(song);
                        }}
                      >
                        {isLiked ? '❤️' : '♡'}
                      </button>
                      <button 
                        className="song-add-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToPlaylist(song);
                        }}
                      >
                        ➕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Esitusloend */}
            {playlist.length > 0 && (
              <div className="playlist-section">
                <h3>📋 Minu esitusloend ({playlist.length})</h3>
                <div className="playlist">
                  {playlist.map((song, index) => (
                    <div
                      key={index}
                      className="playlist-item"
                      onClick={() => setCurrentSong(song)}
                    >
                      <span>{index + 1}.</span>
                      <span className="playlist-title">{song.snippet?.title}</span>
                      <button 
                        className="remove-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlaylist(playlist.filter((_, i) => i !== index));
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;