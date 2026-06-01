import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

const SONGS = [
  { id:'hT_nvWreIhg', title:'Külm',                                        artist:'An Marlen',                  views:4200000,    cat:'ee' },
  { id:'Ys7-6_t7OEQ', title:'Paaristõuked',                                artist:'5MIINUST',                   views:3100000,    cat:'ee' },
  { id:'zZx_z_61JTU', title:'Täna ei maga',                                artist:'Hunt ft. Traffic',           views:1800000,    cat:'ee' },
  { id:'3JZ4pnNtyxQ', title:'(nendest) narkootikumidest ei tea me midagi', artist:'5MIINUST x Puuluup',         views:850000,     cat:'ee' },
  { id:'6cvbv7Dwjvc', title:'Mina ka',                                     artist:'Púr Múdd',                   views:1200000,    cat:'ee' },
  { id:'dQw4w9WgXcQ', title:'Never Gonna Give You Up',                     artist:'Rick Astley',                views:1500000000, cat:'intl' },
  { id:'2Vv-BfVoq4g', title:'Blinding Lights',                             artist:'The Weeknd',                 views:800000000,  cat:'intl' },
  { id:'6Ejga4kJUts', title:'Shape of You',                                artist:'Ed Sheeran',                 views:6200000000, cat:'intl' },
  { id:'7wtfhZwyrcc', title:'Dance Monkey',                                artist:'Tones and I',                views:2300000000, cat:'intl' },
  { id:'j6PZhj5QHZQ', title:'Someone You Loved',                          artist:'Lewis Capaldi',              views:2800000000, cat:'intl' },
  { id:'0VqTwnAuHws', title:'Bad Guy',                                     artist:'Billie Eilish',              views:1900000000, cat:'intl' },
  { id:'RgKAFK5djSk', title:'Uptown Funk',                                 artist:'Mark Ronson ft. Bruno Mars', views:4800000000, cat:'intl' },
  { id:'fRh_vgS2dFE', title:'Believer',                                    artist:'Imagine Dragons',            views:2500000000, cat:'intl' },
  { id:'kTJczUoc26U', title:'Starboy',                                     artist:'The Weeknd',                 views:1400000000, cat:'intl' },
  { id:'YqeW9_5kURI', title:'Perfect',                                     artist:'Ed Sheeran',                 views:3300000000, cat:'intl' },
];

const thumb = (id, size = 'mq') => `https://i.ytimg.com/vi/${id}/${size}default.jpg`;

const MOODS = ['Energiline','Lõõgastumine','Hea tuju','Pidu','Teekond','Treening','Romantika','Kurb','Keskendumine','Uni'];
const MOOD_FILTER = {
  'Energiline':    s => s.views > 2e9,
  'Lõõgastumine': s => s.views < 1e9,
  'Pidu':         s => ['RgKAFK5djSk','7wtfhZwyrcc','dQw4w9WgXcQ'].includes(s.id),
  'Teekond':      s => s.cat === 'intl',
  'Hea tuju':     s => s.views > 1e9,
  'Treening':     s => ['fRh_vgS2dFE','7wtfhZwyrcc','RgKAFK5djSk','2Vv-BfVoq4g'].includes(s.id),
  'Romantika':    s => ['j6PZhj5QHZQ','YqeW9_5kURI','6Ejga4kJUts'].includes(s.id),
  'Kurb':         s => ['j6PZhj5QHZQ','0VqTwnAuHws'].includes(s.id),
  'Keskendumine': s => s.views < 5e8,
  'Uni':          s => s.views < 2e8,
};

const HERO_IMGS = [
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1800&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1800&q=80',
  'https://images.unsplash.com/photo-1501386761578-eaa54b4c2670?w=1800&q=80',
];

const NAV = [
  { id:'home',    label:'Avaleht' },
  { id:'explore', label:'Avasta' },
  { id:'library', label:'Kogu' },
  { id:'radio',   label:'Raadio' },
];

const SB_ICONS = {
  home: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  ),
  explore: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  library: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13"/>
      <circle cx="6" cy="18" r="3"/>
      <circle cx="18" cy="16" r="3"/>
    </svg>
  ),
  radio: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/>
      <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/>
      <circle cx="12" cy="12" r="2"/>
      <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/>
      <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1"/>
    </svg>
  ),
};

const PLAYLISTS = [
  { name: 'Meeldinud muusika', color: '#ff0033' },
  { name: 'Eesti top',         color: '#3ea6ff' },
  { name: 'Rahvusvahelised',   color: '#b8a4ff' },
];

const NAMES   = ['Riks','Riki','Riko','DJ Kuulaja','Melomaan','Muusikasõber'];
const AVATARS = ['🎵','🎸','🎧','🎤','🎹','🥁'];

function fmtViews(n) {
  if (!n) return '';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

function EqBars() {
  return <span className="eq-anim"><span/><span/><span/></span>;
}

export default function App() {
  const [current,  setCurrent]  = useState(SONGS[0]);
  const [autoplay, setAutoplay] = useState(false);
  const [liked,    setLiked]    = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('yt_liked') || '[]')); } catch { return new Set(); }
  });
  const [queue,   setQueue]   = useState([]);
  const [history, setHistory] = useState([SONGS[0]]);

  const [user,         setUser]         = useState(() => {
    try { return JSON.parse(localStorage.getItem('yt_user') || 'null'); } catch { return null; }
  });
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [activeNav,     setActiveNav]     = useState('home');
  const [collapsed,     setCollapsed]     = useState(false);
  const [showQueue,     setShowQueue]     = useState(false);
  const [activeMood,    setActiveMood]    = useState(null);
  const [search,        setSearch]        = useState('');
  const [searchResults, setSearchResults] = useState(null);

  const heroImg = useRef(HERO_IMGS[Math.floor(Math.random() * HERO_IMGS.length)]).current;
  const mainRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('yt_liked', JSON.stringify([...liked]));
  }, [liked]);

  useEffect(() => {
    const h = (e) => { if (!e.target.closest('.user-menu')) setShowUserMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const play = useCallback((song, withAutoplay = true) => {
    setCurrent(song);
    setAutoplay(withAutoplay);
    setHistory(h => [song, ...h.filter(s => s.id !== song.id)].slice(0, 20));
  }, []);

  const toggleLike = useCallback((e, song) => {
    e?.stopPropagation();
    setLiked(prev => {
      const n = new Set(prev);
      n.has(song.id) ? n.delete(song.id) : n.add(song.id);
      return n;
    });
  }, []);

  const addToQueue = useCallback((e, song) => {
    e?.stopPropagation();
    setQueue(q => q.find(s => s.id === song.id) ? q : [...q, song]);
    setShowQueue(true);
  }, []);

  const removeFromQueue = useCallback((id) => {
    setQueue(q => q.filter(s => s.id !== id));
  }, []);

  const playNext = useCallback(() => {
    if (queue.length > 0) {
      const [next, ...rest] = queue;
      setQueue(rest);
      play(next);
      return;
    }
    const idx = SONGS.findIndex(s => s.id === current.id);
    play(SONGS[(idx + 1) % SONGS.length]);
  }, [current, queue, play]);

  const playPrev = useCallback(() => {
    if (history.length > 1) { play(history[1]); return; }
    const idx = SONGS.findIndex(s => s.id === current.id);
    play(SONGS[(idx - 1 + SONGS.length) % SONGS.length]);
  }, [current, history, play]);

  const handleMood = (mood) => {
    if (activeMood === mood) { setActiveMood(null); setSearchResults(null); return; }
    setActiveMood(mood);
    setSearch('');
    const fn = MOOD_FILTER[mood] || (() => true);
    const filtered = SONGS.filter(fn);
    setSearchResults(filtered.length ? filtered : SONGS);
    if (filtered[0]) play(filtered[0]);
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (q) => {
    if (!q.trim()) { setSearchResults(null); return; }
    const lq = q.toLowerCase();
    const filtered = SONGS.filter(s =>
      s.title.toLowerCase().includes(lq) || s.artist.toLowerCase().includes(lq)
    );
    setSearchResults(filtered);
    if (filtered[0]) play(filtered[0], false);
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const login = () => {
    const u = {
      id: 'u_' + Date.now(),
      name: NAMES[Math.floor(Math.random() * NAMES.length)],
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
    };
    setUser(u);
    localStorage.setItem('yt_user', JSON.stringify(u));
    setShowUserMenu(false);
  };

  const logout = () => {
    setUser(null);
    setLiked(new Set());
    setQueue([]);
    localStorage.removeItem('yt_user');
    localStorage.removeItem('yt_liked');
    setShowUserMenu(false);
  };

  const likedSongs   = SONGS.filter(s => liked.has(s.id));
  const embedSrc     = `https://www.youtube.com/embed/${current.id}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1`;

  const cardSections = searchResults
    ? [{ title: activeMood ? `${activeMood} — ${searchResults.length} laulu` : `Otsing: "${search}"`, songs: searchResults }]
    : [
        { title: '🇪🇪 Eesti top',             songs: SONGS.filter(s => s.cat === 'ee') },
        { title: '🌍 Rahvusvahelised hitid',   songs: SONGS.filter(s => s.cat === 'intl') },
        { title: '🔥 Populaarseimad',          songs: [...SONGS].sort((a,b) => b.views - a.views).slice(0, 6) },
        ...(likedSongs.length ? [{ title: '❤️ Sinu meeldivad', songs: likedSongs }] : []),
      ];

  return (
    <div className="app">

      {/* ══ SIDEBAR ══ */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>

        <div className="sb-logo">
          <div className="sb-logo-mark">
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <rect width="16" height="12" rx="2.5" fill="#ff0000"/>
              <polygon points="6.5,2.5 6.5,9.5 12.5,6" fill="white"/>
            </svg>
          </div>
          {!collapsed && (
            <div className="sb-logo-text">
              <span className="sb-yt">YouTube</span>
              <span className="sb-music">MUSIC</span>
            </div>
          )}
        </div>

        <nav className="sb-nav">
          {NAV.map(n => (
            <button key={n.id} className={`sb-item ${activeNav === n.id ? 'active' : ''}`}
              onClick={() => setActiveNav(n.id)}>
              <span className="sb-icon">{SB_ICONS[n.id]}</span>
              {!collapsed && <span className="sb-label">{n.label}</span>}
            </button>
          ))}
        </nav>

        {!collapsed && (
          <>
            <div className="sb-rule"/>
            <span className="sb-section-label">Esitusloendid</span>
            <div className="sb-pls">
              {PLAYLISTS.map(pl => (
                <div key={pl.name} className="sb-pl">
                  <span className="sb-pl-dot" style={{ background: pl.color }}/>
                  {pl.name}
                </div>
              ))}
            </div>
            <button className="sb-new-pl">
              <svg className="sb-new-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Uus esitusloend
            </button>

            <div className="sb-now-playing">
              <img className="sb-np-thumb" src={thumb(current.id)} alt=""/>
              <div className="sb-np-meta">
                <div className="sb-np-title">{current.title}</div>
                <div className="sb-np-artist">{current.artist}</div>
              </div>
              <EqBars/>
            </div>
          </>
        )}

        <button className="sb-collapse" onClick={() => setCollapsed(c => !c)}>
          {collapsed ? '›' : '‹'}
        </button>
      </aside>

      {/* ══ SISU ══ */}
      <div className="content">

        {/* Ülariba */}
        <header className="topbar">
          <div className="search-box">
            <svg className="search-ico" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input className="search-in"
              placeholder="Otsige lugusid, albumeid, esitajaid..."
              value={search}
              onChange={e => { setSearch(e.target.value); if (!e.target.value) { setSearchResults(null); setActiveMood(null); } }}
              onKeyDown={e => e.key === 'Enter' && handleSearch(search)}
            />
            {search && (
              <button onClick={() => { setSearch(''); setSearchResults(null); setActiveMood(null); }}
                style={{color:'var(--text2)',fontSize:16,padding:'0 4px',lineHeight:1}}>✕</button>
            )}
          </div>

          <div className="tb-right">
            <button className="tb-btn" title="Järjekord" onClick={() => setShowQueue(q => !q)}>
              <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                <path d="M3 5h14M3 10h10M3 15h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {queue.length > 0 && <span className="tb-badge">{queue.length}</span>}
            </button>

            {user ? (
              <div className="user-menu">
                <div className="tb-avatar" onClick={() => setShowUserMenu(m => !m)}>
                  <span style={{fontSize:20}}>{user.avatar}</span>
                </div>
                {showUserMenu && (
                  <div className="user-dropdown">
                    <span className="user-name">👋 {user.name}</span>
                    <div style={{fontSize:12,color:'var(--text2)',padding:'4px 12px 8px'}}>
                      ❤️ {liked.size} meeldivat · 📋 {queue.length} järjekorras
                    </div>
                    <button className="logout-btn" onClick={logout}>Logi välja</button>
                  </div>
                )}
              </div>
            ) : (
              <button className="login-btn-header" onClick={login}>▶ Alusta</button>
            )}
          </div>
        </header>

        {/* Meeleoluribad */}
        <div className="mood-bar">
          {MOODS.map(m => (
            <button key={m} className={`mood-pill ${activeMood === m ? 'active' : ''}`}
              onClick={() => handleMood(m)}>
              {m}
            </button>
          ))}
        </div>

        {/* Keritav sisu */}
        <main className="scroll-area" ref={mainRef}>

          <div className="hero" style={{backgroundImage:`url(${heroImg})`}}>
            <div className="hero-grad"/>
            <div className="hero-body">
              <p className="hero-eyebrow">
                {user ? `🎉 Tere, ${user.name}!` : '🎧 EESTI MUUSIKA'}
              </p>
              <h1 className="hero-h1">
                {activeMood ? activeMood : user ? 'Sinu muusika' : 'Populaarsed hitid'}
              </h1>
              {!user && (
                <button className="hero-login-btn" onClick={login}>▶ Alusta kuulamist</button>
              )}
            </div>
          </div>

          {/* Mängija */}
          <section className="player-wrap">
            <div className="player-video">
              <iframe key={current.id} src={embedSrc}
                title="YouTube player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen/>
            </div>
            <div className="player-info">
              <div className="player-now">PRAEGU MÄNGIB</div>
              <h2 className="player-title">{current.title}</h2>
              <p className="player-artist">{current.artist}</p>
              <p style={{fontSize:12,color:'var(--text2)',marginBottom:14}}>
                {fmtViews(current.views)} vaatamist
              </p>
              <div className="player-controls">
                <button className="ctrl-btn" onClick={playPrev}>◀ Eelmine</button>
                <button className="ctrl-btn" onClick={playNext}>Järgmine ▶</button>
                <button
                  className={`ctrl-btn like-ctrl ${liked.has(current.id) ? 'liked' : ''}`}
                  onClick={e => toggleLike(e, current)}>
                  {liked.has(current.id) ? '❤️ Meeldib' : '🤍 Meeldimine'}
                </button>
                <button className="ctrl-btn" onClick={e => addToQueue(e, current)}>
                  ➕ Järjekorda
                </button>
                <a className="ctrl-btn" style={{textDecoration:'none'}}
                  href={`https://music.youtube.com/watch?v=${current.id}`} target="_blank" rel="noreferrer">
                  ↗ YT Music
                </a>
              </div>
            </div>
          </section>

          {/* Kõik lood */}
          <section className="list-sec">
            <h2 className="sec-title">🎧 Kõik lood</h2>
            <div className="track-list">
              {(searchResults ?? SONGS).map((song, i) => {
                const playing = current.id === song.id;
                return (
                  <div key={song.id} className={`track-row ${playing ? 'playing' : ''}`}
                    onClick={() => play(song)}>
                    <span className="track-num">
                      {playing ? <EqBars/> : i + 1}
                    </span>
                    <img className="track-thumb" src={thumb(song.id)} alt="" loading="lazy"/>
                    <div className="track-meta">
                      <div className="track-name">{song.title}</div>
                      <div className="track-ch">{song.artist}</div>
                    </div>
                    <span className="track-views">{fmtViews(song.views)}</span>
                    <div className="track-actions">
                      <button className={`t-btn ${liked.has(song.id) ? 'liked' : ''}`}
                        onClick={e => toggleLike(e, song)} title="Meeldi">❤️</button>
                      <button className="t-btn" onClick={e => addToQueue(e, song)} title="Lisa järjekorda">➕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Kaardisektsioonid */}
          {!searchResults && cardSections.map(sec => (
            <section key={sec.title} className="card-sec">
              <div className="card-sec-hd">
                <h2 className="sec-title">{sec.title}</h2>
                <button className="more-btn">Rohkem ›</button>
              </div>
              <div className="card-grid">
                {sec.songs.slice(0, 6).map(song => {
                  const playing = current.id === song.id;
                  return (
                    <div key={song.id} className={`music-card ${playing ? 'card-playing' : ''}`}
                      onClick={() => play(song)}>
                      <div className="card-art">
                        <img src={thumb(song.id, 'mq')} alt="" loading="lazy"/>
                        <div className="card-overlay">
                          <div className="card-play-btn">▶</div>
                          <button className="card-like" onClick={e => toggleLike(e, song)}>
                            {liked.has(song.id) ? '❤️' : '🤍'}
                          </button>
                        </div>
                        {playing && <div className="card-now-playing"><span/><span/><span/></div>}
                      </div>
                      <div className="card-body">
                        <div className="card-name">{song.title}</div>
                        <div className="card-ch">{song.artist}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          {searchResults && searchResults.length === 0 && (
            <div style={{textAlign:'center',padding:'60px 32px',color:'var(--text2)'}}>
              <div style={{fontSize:48,marginBottom:12}}>🔍</div>
              <p style={{fontSize:18,fontWeight:700,color:'var(--text1)'}}>Tulemusi ei leitud</p>
              <p style={{marginTop:6}}>Proovi teist otsingusõna</p>
            </div>
          )}

          <div style={{height:60}}/>
        </main>

        {/* Järjekorra paneel */}
        {showQueue && (
          <aside className="pl-panel">
            <div className="pl-hd">
              <h3>Järjekord <span className="pl-count">{queue.length} laulu</span></h3>
              <button className="pl-close" onClick={() => setShowQueue(false)}>✕</button>
            </div>
            {queue.length === 0 ? (
              <div className="pl-empty">
                <div style={{fontSize:40,marginBottom:8}}>🎵</div>
                <p>Järjekord on tühi</p>
                <p style={{fontSize:12,marginTop:4}}>Lisa lugusid ➕ nupuga</p>
              </div>
            ) : (
              <>
                <div className="pl-list">
                  {queue.map((song, i) => (
                    <div key={song.id + i}
                      className={`pl-item ${current.id === song.id ? 'playing' : ''}`}
                      onClick={() => { removeFromQueue(song.id); play(song); }}>
                      <span className="pl-n">{i + 1}</span>
                      <img className="pl-thumb" src={thumb(song.id)} alt="" loading="lazy"/>
                      <span className="pl-name">
                        {song.title}
                        <br/>
                        <span style={{fontSize:11,color:'var(--text2)'}}>{song.artist}</span>
                      </span>
                      <button className="pl-rm"
                        onClick={e => { e.stopPropagation(); removeFromQueue(song.id); }}>✕</button>
                    </div>
                  ))}
                </div>
                <div style={{padding:'12px 16px',borderTop:'1px solid var(--line)'}}>
                  <button onClick={() => setQueue([])}
                    style={{width:'100%',padding:'8px',borderRadius:10,background:'var(--bg3)',
                      color:'var(--text2)',fontSize:13,fontWeight:600,cursor:'pointer',border:'none'}}>
                    🗑 Tühjenda järjekord
                  </button>
                </div>
              </>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}