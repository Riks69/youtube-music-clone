import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const API_KEY = 'AIzaSyBA3Smqj1yld8Gx1P17mLw77O_ZXDK82J';
const API_URL = 'https://www.googleapis.com/youtube/v3';

const NAV_ITEMS = [
  { icon: '⊞', label: 'Avaleht', id: 'home' },
  { icon: '✦', label: 'Avastamiseks', id: 'explore' },
  { icon: '◫', label: 'Kogu', id: 'library' },
];

const MOODS = ['Energiline','Lõõgastumine','Hea tuju','Pidu','Teekond','Treening','Romantika','Kurb','Keskendumine','Uni'];

const SECTIONS = [
  { title: 'Tänased hitid', query: 'top hits 2024', emoji: '🔥' },
  { title: 'Eesti muusika', query: 'eesti muusika 2024', emoji: '🇪🇪' },
  { title: 'Chill Out', query: 'chill lofi relaxing music', emoji: '🌙' },
  { title: 'Hip-Hop', query: 'hiphop rap hits 2024', emoji: '🎤' },
];

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1800&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1800&q=80',
  'https://images.unsplash.com/photo-1501386761578-eaa54b4c2670?w=1800&q=80',
];

export default function App() {
  const [currentSong, setCurrentSong] = useState(null);
  const [sections, setSections] = useState({});
  const [loadingSections, setLoadingSections] = useState({});
  const [popularList, setPopularList] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [activeNav, setActiveNav] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [heroImg] = useState(() => HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showPlaylistPanel, setShowPlaylistPanel] = useState(false);
  const [activeMood, setActiveMood] = useState(null);
  const mainRef = useRef(null);

  const fetchSection = async (section) => {
    setLoadingSections(prev => ({ ...prev, [section.title]: true }));
    try {
      const res = await fetch(`${API_URL}/search?part=snippet&maxResults=6&q=${encodeURIComponent(section.query)}&type=video&videoCategoryId=10&key=${API_KEY}`);
      const data = await res.json();
      setSections(prev => ({ ...prev, [section.title]: data.items || [] }));
    } catch (e) { console.error(e); }
    finally { setLoadingSections(prev => ({ ...prev, [section.title]: false })); }
  };

  const loadPopular = async () => {
    try {
      const res = await fetch(`${API_URL}/videos?part=snippet,statistics&chart=mostPopular&videoCategoryId=10&maxResults=20&regionCode=EE&key=${API_KEY}`);
      const data = await res.json();
      const items = data.items || [];
      setPopularList(items);
      if (items[0]) setCurrentSong(items[0]);
    } catch(e) { console.error(e); }
  };

  const searchSongs = async (query) => {
    if (!query.trim()) return;
    try {
      const res = await fetch(`${API_URL}/search?part=snippet&maxResults=12&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&key=${API_KEY}`);
      const data = await res.json();
      const items = data.items || [];
      setSections({ 'Otsingutulemused': items });
      if (items[0]) setCurrentSong(items[0]);
      mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } catch(e) { console.error(e); }
  };

  useEffect(() => {
    loadPopular();
    SECTIONS.forEach(s => fetchSection(s));
  }, []);

  const getId = (s) => s?.id?.videoId || s?.id;
  const isLiked = (s) => likedSongs.some(x => getId(x) === getId(s));
  const isPlaying = (s) => getId(currentSong) === getId(s);

  const toggleLike = (e, s) => {
    e?.stopPropagation();
    setLikedSongs(prev => isLiked(s) ? prev.filter(x => getId(x) !== getId(s)) : [...prev, s]);
  };
  const addToPlaylist = (e, s) => {
    e?.stopPropagation();
    if (!playlist.find(x => getId(x) === getId(s))) setPlaylist(prev => [...prev, s]);
  };
  const handleMood = (mood) => { setActiveMood(mood); searchSongs(mood + ' music playlist'); };
  const nextSong = () => {
    const idx = popularList.findIndex(s => getId(s) === getId(currentSong));
    if (idx >= 0 && idx < popularList.length - 1) setCurrentSong(popularList[idx + 1]);
  };
  const prevSong = () => {
    const idx = popularList.findIndex(s => getId(s) === getId(currentSong));
    if (idx > 0) setCurrentSong(popularList[idx - 1]);
  };
  const fmtViews = (v) => {
    if (!v) return '';
    const n = parseInt(v);
    if (n >= 1e9) return (n/1e9).toFixed(1)+'B';
    if (n >= 1e6) return (n/1e6).toFixed(1)+'M';
    if (n >= 1e3) return (n/1e3).toFixed(1)+'K';
    return n;
  };

  return (
    <div className="app">
      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sb-logo">
          <div className="sb-logo-icon">
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
              <rect width="20" height="14" rx="3" fill="#ff0000"/>
              <polygon points="8,3 8,11 15,7" fill="white"/>
            </svg>
          </div>
          {!sidebarCollapsed && (
            <div className="sb-logo-text">
              <span className="sb-yt">YouTube</span>
              <span className="sb-music">MUSIC</span>
            </div>
          )}
        </div>

        <nav className="sb-nav">
          {NAV_ITEMS.map(item => (
            <button key={item.id} className={`sb-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => { setActiveNav(item.id); if(item.id==='home') loadPopular(); }}>
              <span className="sb-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="sb-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sb-rule" />

        {!sidebarCollapsed && (
          <>
            <button className="sb-new-pl">
              <span className="sb-icon">＋</span>
              <span>Uus esitusloend</span>
            </button>
            <div className="sb-pls">
              {['Meeldinud muusika','Rajendrani Tõlkelood','Jaod hilisemaks'].map(pl => (
                <div key={pl} className="sb-pl">{pl}</div>
              ))}
            </div>
          </>
        )}

        <button className="sb-collapse" onClick={() => setSidebarCollapsed(p => !p)}>
          {sidebarCollapsed ? '›' : '‹'}
        </button>
      </aside>

      {/* ── Main area ── */}
      <div className="content">

        {/* Topbar */}
        <header className="topbar">
          <div className="search-box">
            <svg className="search-ico" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input className="search-in" placeholder="Otsige lugusid, albumeid, esitajaid, podcaste"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchSongs(searchQuery)} />
          </div>
          <div className="tb-right">
            <button className="tb-btn" onClick={() => setShowPlaylistPanel(p => !p)} title="Esitusloend">
              <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                <path d="M3 5h14M3 10h10M3 15h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {playlist.length > 0 && <span className="tb-badge">{playlist.length}</span>}
            </button>
            <button className="tb-btn" title="Meeldinud">
              <svg viewBox="0 0 20 20" fill={likedSongs.length ? '#ff4444' : 'none'} width="18" height="18">
                <path d="M10 16s-7-4.5-7-8.5A4 4 0 0110 4.5a4 4 0 017 3c0 4-7 8.5-7 8.5z" stroke={likedSongs.length ? '#ff4444' : 'currentColor'} strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              {likedSongs.length > 0 && <span className="tb-badge">{likedSongs.length}</span>}
            </button>
            <div className="tb-avatar">
              <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </header>

        {/* Mood bar */}
        <div className="mood-bar">
          {MOODS.map(m => (
            <button key={m} className={`mood-pill ${activeMood === m ? 'active' : ''}`}
              onClick={() => handleMood(m)}>{m}</button>
          ))}
        </div>

        {/* Scrollable content */}
        <main className="scroll-area" ref={mainRef}>

          {/* Hero */}
          <div className="hero" style={{ backgroundImage: `url(${heroImg})` }}>
            <div className="hero-grad" />
            <div className="hero-body">
              <p className="hero-eyebrow">PARIMAD RAHVUSVAHELISED HITID PRAEGU</p>
              <h1 className="hero-h1">Tänased hitid</h1>
            </div>
          </div>

          {/* Player */}
          {currentSong && (
            <section className="player-wrap">
              <div className="player-video">
                <iframe
                  src={`https://www.youtube.com/embed/${getId(currentSong)}?autoplay=1&rel=0&modestbranding=1`}
                  title="player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen />
              </div>
              <div className="player-info">
                <div className="player-now">PRAEGU MÄNGIB</div>
                <h2 className="player-title">{currentSong.snippet?.title}</h2>
                <p className="player-artist">{currentSong.snippet?.channelTitle}</p>
                <div className="player-controls">
                  <button className="ctrl-btn" onClick={prevSong} title="Eelmine">
                    <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                      <path d="M14 4L6 10l8 6V4z" fill="currentColor"/><rect x="4" y="4" width="2" height="12" rx="1" fill="currentColor"/>
                    </svg>
                  </button>
                  <button className="ctrl-btn" onClick={nextSong} title="Järgmine">
                    <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                      <path d="M6 4l8 6-8 6V4z" fill="currentColor"/><rect x="14" y="4" width="2" height="12" rx="1" fill="currentColor"/>
                    </svg>
                  </button>
                  <button className={`ctrl-btn like-ctrl ${isLiked(currentSong) ? 'liked' : ''}`}
                    onClick={e => toggleLike(e, currentSong)}>
                    <svg viewBox="0 0 20 20" fill={isLiked(currentSong) ? '#ff4444' : 'none'} width="16" height="16">
                      <path d="M10 16s-7-4.5-7-8.5A4 4 0 0110 4.5a4 4 0 017 3c0 4-7 8.5-7 8.5z"
                        stroke={isLiked(currentSong) ? '#ff4444' : 'currentColor'} strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                    {isLiked(currentSong) ? 'Meeldib' : 'Meeldimine'}
                  </button>
                  <button className="ctrl-btn add-ctrl" onClick={e => addToPlaylist(e, currentSong)}>
                    <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    Lisa loendisse
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Popular list */}
          {popularList.length > 0 && (
            <section className="list-sec">
              <h2 className="sec-title">🎧 Populaarsed lood Eestis</h2>
              <div className="track-list">
                {popularList.map((song, i) => {
                  const id = getId(song);
                  const active = isPlaying(song);
                  return (
                    <div key={id} className={`track-row ${active ? 'playing' : ''}`}
                      onClick={() => setCurrentSong(song)}>
                      <span className="track-num">{active
                        ? <span className="eq-anim"><span/><span/><span/></span>
                        : i + 1}</span>
                      <img className="track-thumb" src={song.snippet?.thumbnails?.default?.url} alt="" />
                      <div className="track-meta">
                        <div className="track-name">{song.snippet?.title}</div>
                        <div className="track-ch">{song.snippet?.channelTitle}</div>
                      </div>
                      <span className="track-views">{fmtViews(song.statistics?.viewCount)}</span>
                      <div className="track-actions">
                        <button className={`t-btn ${isLiked(song) ? 'liked' : ''}`} onClick={e => toggleLike(e, song)}>
                          <svg viewBox="0 0 20 20" fill={isLiked(song) ? '#ff4444' : 'none'} width="15" height="15">
                            <path d="M10 15s-6-4-6-7.5A3.5 3.5 0 0110 5a3.5 3.5 0 016 2.5C16 11 10 15 10 15z"
                              stroke={isLiked(song) ? '#ff4444' : 'currentColor'} strokeWidth="1.4" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button className="t-btn" onClick={e => addToPlaylist(e, song)}>
                          <svg viewBox="0 0 20 20" fill="none" width="15" height="15">
                            <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Card sections */}
          {SECTIONS.map(sec => {
            const items = sections[sec.title] || [];
            const loading = loadingSections[sec.title];
            return (
              <section key={sec.title} className="card-sec">
                <div className="card-sec-hd">
                  <h2 className="sec-title">{sec.emoji} {sec.title}</h2>
                  <button className="more-btn">Rohkem ›</button>
                </div>
                <div className="card-grid">
                  {loading
                    ? [...Array(6)].map((_,i) => <div key={i} className="card-skeleton" />)
                    : items.map(song => {
                        const id = getId(song);
                        const thumb = song.snippet?.thumbnails?.high?.url || song.snippet?.thumbnails?.default?.url;
                        return (
                          <div key={id} className={`music-card ${isPlaying(song) ? 'card-playing' : ''}`}
                            onClick={() => setCurrentSong(song)}>
                            <div className="card-art">
                              <img src={thumb} alt="" />
                              <div className="card-overlay">
                                <div className="card-play-btn">
                                  <svg viewBox="0 0 20 20" fill="none" width="22" height="22">
                                    <circle cx="10" cy="10" r="9" fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
                                    <polygon points="8,6 15,10 8,14" fill="white"/>
                                  </svg>
                                </div>
                                <button className="card-like" onClick={e => toggleLike(e, song)}>
                                  <svg viewBox="0 0 20 20" fill={isLiked(song) ? '#ff4444' : 'none'} width="14" height="14">
                                    <path d="M10 15s-6-4-6-7.5A3.5 3.5 0 0110 5a3.5 3.5 0 016 2.5C16 11 10 15 10 15z"
                                      stroke={isLiked(song) ? '#ff4444' : 'white'} strokeWidth="1.4" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              </div>
                              {isPlaying(song) && <div className="card-now-playing"><span/><span/><span/></div>}
                            </div>
                            <div className="card-body">
                              <div className="card-name">{song.snippet?.title}</div>
                              <div className="card-ch">{song.snippet?.channelTitle}</div>
                            </div>
                          </div>
                        );
                      })
                  }
                </div>
              </section>
            );
          })}

          <div style={{height: '60px'}} />
        </main>

        {/* Playlist side panel */}
        {showPlaylistPanel && (
          <aside className="pl-panel">
            <div className="pl-hd">
              <h3>Esitusloend <span className="pl-count">{playlist.length}</span></h3>
              <button className="pl-close" onClick={() => setShowPlaylistPanel(false)}>✕</button>
            </div>
            {playlist.length === 0
              ? <div className="pl-empty"><p>Esitusloend on tühi</p><p>Lisa lugusid ➕ nupuga</p></div>
              : <div className="pl-list">
                  {playlist.map((song, i) => (
                    <div key={i} className={`pl-item ${isPlaying(song) ? 'playing' : ''}`}
                      onClick={() => setCurrentSong(song)}>
                      <span className="pl-n">{i+1}</span>
                      <img className="pl-thumb" src={song.snippet?.thumbnails?.default?.url} alt="" />
                      <span className="pl-name">{song.snippet?.title}</span>
                      <button className="pl-rm" onClick={e => { e.stopPropagation(); setPlaylist(prev => prev.filter((_,j) => j !== i)); }}>✕</button>
                    </div>
                  ))}
                </div>
            }
          </aside>
        )}
      </div>
    </div>
  );
}