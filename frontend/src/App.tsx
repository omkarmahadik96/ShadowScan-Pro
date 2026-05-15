import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Search,
  Bell,
  Eye,
  Activity,
  Users,
  FileText,
  Settings as SettingsIcon,
  Globe,
  Terminal,
  Cpu,
  X,
  User,
  ShieldCheck,
  LogOut,
  Save,
  ShieldAlert,
  BookOpen,
  Menu
} from 'lucide-react';
import { useSocket } from './hooks/useSocket';
import { useFindingsStore } from './store/findingsStore';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from './utils/cropImage';

import Dashboard from './pages/Dashboard';
import Findings from './pages/Findings';
import Alerts from './pages/Alerts';
import Investigation from './pages/Investigation';
import Watchlist from './pages/Watchlist';
import ThreatActors from './pages/ThreatActors';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Guide from './pages/Guide';
import './App.css';

const Sidebar = ({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'Intelligence', path: '/findings', icon: Search },
    { label: 'Threat Alerts', path: '/alerts', icon: Bell },
    { label: 'Investigation', path: '/investigation', icon: Eye },
    { label: 'Watchlist', path: '/watchlist', icon: Activity },
    { label: 'Adversaries', path: '/threat-actors', icon: Users },
    { label: 'Reporting', path: '/reports', icon: FileText },
    { label: 'Guide', path: '/guide', icon: BookOpen },
    { label: 'System Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'active' : ''}`}>
      <div className="sidebar-brand">
        <Shield className="brand-logo" size={32} />
        <span className="brand-name glow-cyan">SHADOWSCAN</span>
        <button className="mobile-close-btn" onClick={onClose}>
           <X size={24} />
        </button>
      </div>

      <nav className="nav-group">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={onClose}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', padding: '1rem' }}>
        <div className="nav-item" style={{ opacity: 0.5 }}>
          <Cpu size={16} />
          <span style={{ fontSize: '0.65rem' }}>CORE_KERNEL_v4.2</span>
        </div>
      </div>
    </aside>
  );
};

// Enhanced Tactical Profile Modal with Image Cropping
const ProfileModal = ({ user, updateUser, onClose, stats }: { user: any, updateUser: (u: any) => void, onClose: () => void, stats: any }) => {
  const [tempUser, setTempUser] = React.useState(user);
  const [image, setImage] = React.useState<string | null>(null);
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState(null);
  const [showCropper, setShowCropper] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImage(reader.result as string);
        setShowCropper(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const finalizeCrop = async () => {
    try {
      if (image && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(image, croppedAreaPixels);
        setTempUser({ ...tempUser, profilePic: croppedImage });
        setShowCropper(false);
        setImage(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const [showSuccess, setShowSuccess] = React.useState(false);

  const saveProfile = () => {
    setShowSuccess(true);
    updateUser(tempUser);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const roles = ["System Architect", "Senior Analyst", "Field Operative", "Forensic Expert", "Network Guardian"];

  return (
    <div className="generation-overlay" style={{ background: 'rgba(5, 5, 8, 0.94)', backdropFilter: 'blur(20px)', zIndex: 9999 }}>

      {/* Success Notification Overlay */}
      {showSuccess && (
        <div className="animate-in" style={{ position: 'absolute', inset: 0, background: 'rgba(0, 242, 255, 0.1)', backdropFilter: 'blur(10px)', zIndex: 10005, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px var(--accent-cyan)' }}>
            <ShieldCheck size={40} color="black" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 className="data-mono" style={{ color: 'white', letterSpacing: '4px', margin: 0 }}>DATA_SYNC_COMPLETE</h3>
            <p className="data-mono" style={{ color: 'var(--accent-cyan)', fontSize: '0.7rem', marginTop: '0.5rem' }}>AUTHORITY_IDENTITY_PERSISTED</p>
          </div>
          <div className="scanning-line" style={{ position: 'absolute', top: 0 }}></div>
        </div>
      )}

      {/* Image Cropper Overlay */}
      {showCropper && image && (
        <div style={{ position: 'fixed', inset: 0, background: 'black', zIndex: 10001, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              cropShape="round"
              showGrid={false}
            />
          </div>
          <div style={{ height: '120px', background: '#0a0a0f', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--accent-cyan)' }}>
            <div style={{ width: '200px' }}>
              <label className="data-mono" style={{ fontSize: '0.6rem', color: 'var(--accent-cyan)', display: 'block', marginBottom: '0.5rem' }}>ZOOM_LEVEL</label>
              <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} style={{ width: '100%' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setShowCropper(false)} className="data-mono" style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid #ff3e3e', color: '#ff3e3e', borderRadius: '4px', cursor: 'pointer' }}>CANCEL</button>
              <button onClick={finalizeCrop} className="data-mono btn-glow" style={{ padding: '0.75rem 1.5rem', background: 'var(--accent-cyan)', border: 'none', color: 'black', borderRadius: '4px', cursor: 'pointer', fontWeight: 900 }}>INITIALIZE_BIOMETRIC_SYNC</button>
            </div>
          </div>
        </div>
      )}

      <div className="glass animate-in profile-modal-container" style={{ padding: '0', border: '1px solid rgba(0, 242, 255, 0.4)', position: 'relative', overflow: 'hidden', borderRadius: '12px', boxShadow: '0 0 80px rgba(0,0,0,0.9)' }}>
        <div style={{ height: '4px', background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-blue))' }}></div>

        <div style={{ padding: '2rem' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }} className="hover-cyan">
            <X size={18} />
          </button>

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: tempUser.profilePic ? `url(${tempUser.profilePic})` : 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                margin: '0 auto 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                fontWeight: 900,
                color: 'black',
                boxShadow: '0 0 40px rgba(0, 242, 255, 0.3)',
                border: '3px solid rgba(0, 242, 255, 0.2)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              className="profile-pic-hover"
            >
              {!tempUser.profilePic && tempUser.avatar}
              <div className="upload-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }}>
                <Cpu size={20} style={{ color: 'white' }} />
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />

            <h2 className="data-mono" style={{ fontSize: '1.2rem', letterSpacing: '4px', color: 'white', margin: 0, fontWeight: 900 }}>AUTHORITY_PROFILE</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
              <ShieldCheck size={14} style={{ color: 'var(--accent-cyan)' }} />
              <span className="data-mono" style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', letterSpacing: '1px' }}>BIOMETRIC_ID_VERIFIED</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="input-group">
              <label className="data-mono" style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginBottom: '0.4rem', display: 'block' }}>OPERATOR_IDENTIFIER</label>
              <input
                type="text"
                value={tempUser.name}
                onChange={(e) => setTempUser({ ...tempUser, name: e.target.value.toUpperCase(), avatar: e.target.value.substring(0, 2).toUpperCase() })}
                style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', padding: '0.75rem 1rem', borderRadius: '4px', color: 'white', fontFamily: 'JetBrains Mono', fontSize: '0.9rem', borderLeft: '3px solid var(--accent-cyan)' }}
              />
            </div>

            <div className="input-group">
              <label className="data-mono" style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginBottom: '0.4rem', display: 'block' }}>ASSIGNED_DESIGNATION</label>
              <select
                value={tempUser.role}
                onChange={(e) => setTempUser({ ...tempUser, role: e.target.value })}
                style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', padding: '0.75rem 1rem', borderRadius: '4px', color: 'white', fontFamily: 'JetBrains Mono', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                {roles.map(r => <option key={r} value={r} style={{ background: '#0a0a0f' }}>{r.toUpperCase()}</option>)}
              </select>
            </div>

            {/* Session Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="data-mono" style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>INTEL_LOGGED</div>
                <div className="data-mono" style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)', fontWeight: 900 }}>{stats.totalFindings || 0}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="data-mono" style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>CRITICAL_SYNC</div>
                <div className="data-mono" style={{ fontSize: '1.1rem', color: 'var(--accent-red)', fontWeight: 900 }}>{stats.criticalThreats || 0}</div>
              </div>
            </div>

            <button
              onClick={saveProfile}
              style={{ width: '100%', background: 'var(--accent-cyan)', color: 'black', border: 'none', padding: '1rem', borderRadius: '4px', fontWeight: 900, cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', boxShadow: '0 0 20px rgba(0, 242, 255, 0.2)' }}
              className="btn-glow"
            >
              <Save size={16} /> SYNC_AUTHORITY_IDENTITY
            </button>
          </div>
        </div>

        {/* Attractive High-Contrast Authority Key */}
        <div style={{ padding: '1rem 2rem', background: 'rgba(255,255,255,0.05)', borderTop: '1px solid var(--accent-cyan)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="data-mono" style={{ fontSize: '0.6rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>AUTHORITY_KEY:</span>
          <span className="data-mono" style={{ fontSize: '0.8rem', color: 'white', fontWeight: 900, letterSpacing: '1px' }}>
            {tempUser.name?.substring(0, 3) || 'ADM'}-{(Math.random() * 10000).toFixed(0)}-XXXX
          </span>
        </div>
      </div>
    </div>
  );
};

// Global Network Panel
const GlobePanel = ({ onClose }: { onClose: () => void }) => {
  const { findings, globalIntel, networkLogs } = useFindingsStore();
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = pan.x + e.movementX;
      const newY = pan.y + e.movementY;
      
      // Clamp values to prevent seeing the black background
      // Map is 1200x800, Container is variable. Limit to ~20% bleed.
      const clampedX = Math.min(Math.max(newX, -400), 200);
      const clampedY = Math.min(Math.max(newY, -200), 200);

      setPan({ x: clampedX, y: clampedY });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="generation-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(5, 5, 8, 0.9)', backdropFilter: 'blur(20px)', zIndex: 9999 }}>
      <div className="glass animate-in globe-panel-container" style={{
        width: '92vw',
        height: '85vh',
        maxWidth: '1350px',
        maxHeight: '800px',
        padding: '0',
        border: '1px solid rgba(0, 242, 255, 0.25)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 0 80px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 242, 255, 0.1)',
        position: 'relative',
        borderRadius: '8px'
      }}>
        {/* Tactical Corner Markers */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', width: '20px', height: '20px', borderTop: '2px solid var(--accent-cyan)', borderLeft: '2px solid var(--accent-cyan)', opacity: 0.5 }}></div>
        <div style={{ position: 'absolute', top: '10px', right: '10px', width: '20px', height: '20px', borderTop: '2px solid var(--accent-cyan)', borderRight: '2px solid var(--accent-cyan)', opacity: 0.5 }}></div>
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '20px', height: '20px', borderBottom: '2px solid var(--accent-cyan)', borderLeft: '2px solid var(--accent-cyan)', opacity: 0.5 }}></div>
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '20px', height: '20px', borderBottom: '2px solid var(--accent-cyan)', borderRight: '2px solid var(--accent-cyan)', opacity: 0.5 }}></div>

        <div className="modal-header globe-modal-header" style={{
          background: 'rgba(0, 242, 255, 0.03)',
          padding: '1.5rem 2.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div className="status-dot animate-pulse" style={{ width: '10px', height: '10px', background: 'var(--accent-cyan)', borderRadius: '50%', boxShadow: '0 0 15px var(--accent-cyan)' }}></div>
            <div className="globe-header-text">
              <h2 className="data-mono title-text" style={{ fontSize: '1.2rem', letterSpacing: '4px', color: 'white', margin: 0, fontWeight: 800 }}>WORLD_SURVEILLANCE_GRID</h2>
              <div className="subtitle-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem' }}>
                <span className="data-mono" style={{ fontSize: '0.6rem', color: 'var(--accent-cyan)', opacity: 0.8 }}>ENCRYPTED_UPLINK_ESTABLISHED</span>
                <div className="desktop-only" style={{ width: '4px', height: '4px', background: 'var(--text-dim)', borderRadius: '50%' }}></div>
                <span className="data-mono desktop-only" style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>STATION_ID: ALPHA_PRIME_01</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="hover-cyan" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.6rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <X size={18} /> <span className="desktop-only data-mono" style={{ fontSize: '0.7rem' }}>DISCONNECT</span>
          </button>
        </div>

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', gap: '0' }} className="mobile-responsive-grid">
          <div
            style={{
              background: '#020204',
              position: 'relative',
              overflow: 'hidden',
              borderRight: '1px solid rgba(255,255,255,0.05)',
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="mobile-map-view"
          >
            {/* Interactive Viewport Container */}
            <div style={{
              position: 'absolute',
              width: '1200px',
              height: '800px',
              transform: `translate3d(${pan.x - 125}px, ${pan.y - 90}px, 0)`,
              backgroundImage: `url('/tactical_world_map_bg.png')`,
              backgroundSize: '100% 100%',
              willChange: 'transform',
              pointerEvents: 'none',
              transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}>
              {/* Hexagonal/Grid Background Overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.1,
                backgroundSize: '30px 30px',
                backgroundImage: 'radial-gradient(var(--accent-cyan) 0.5px, transparent 0.5px)',
              }}></div>

              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  {/* Full Mesh Connection (Surgical SVG) */}
                  <svg viewBox="0 0 1000 600" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden' }}>
                    {/* Dynamic Mesh Connections */}
                    {[
                      { x1: 150, y1: 180, x2: 500, y2: 150, color: 'var(--accent-cyan)' }, // NA -> EU
                      { x1: 500, y1: 150, x2: 750, y2: 180, color: 'var(--accent-green)' }, // EU -> ASIA
                      { x1: 750, y1: 180, x2: 850, y2: 450, color: 'var(--accent-cyan)' }, // ASIA -> OCE
                      { x1: 500, y1: 150, x2: 520, y2: 330, color: '#8b5cf6' }, // EU -> AF
                      { x1: 150, y1: 180, x2: 280, y2: 390, color: '#f59e0b' }, // NA -> SA
                      { x1: 520, y1: 330, x2: 850, y2: 450, color: 'var(--accent-red)' }, // AF -> OCE
                    ].map((l, i) => (
                      <g key={i}>
                        <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={l.color} strokeWidth="1" opacity="0.1" />
                        <circle r="1.5" fill={l.color}>
                          <animateMotion dur={`${2.5 + i}s`} repeatCount="indefinite" path={`M ${l.x1} ${l.y1} L ${l.x2} ${l.y2}`} />
                        </circle>
                      </g>
                    ))}
                  </svg>

                  {/* Autonomous Node Plotting (Driven by Backend Findings) */}
                  {(() => {
                    const SOURCE_COORDS: Record<string, { top: string, left: string, color: string }> = {
                      'Ahmia': { top: '25%', left: '50%', color: '#8b5cf6' },
                      'DeepSearch': { top: '30%', left: '15%', color: 'var(--accent-cyan)' },
                      'Torch': { top: '30%', left: '75%', color: 'var(--accent-green)' },
                      'Haystack': { top: '65%', left: '28%', color: '#f59e0b' },
                      'DarkEngine': { top: '55%', left: '52%', color: 'var(--accent-red)' },
                      'OnionLink': { top: '75%', left: '85%', color: 'var(--accent-cyan)' },
                      'HiddenWiki': { top: '22%', left: '50%', color: 'var(--accent-blue)' }
                    };

                    const validFindings = Array.isArray(findings) ? findings : [];
                    const activeSources = Array.from(new Set(validFindings.map(f => f?.source))).filter(s => s && SOURCE_COORDS[s]);

                    return activeSources.map(source => {
                      const coords = SOURCE_COORDS[source];
                      return (
                        <div key={source} style={{ position: 'absolute', top: coords.top, left: coords.left }} className="animate-pulse">
                          <div style={{ width: '10px', height: '10px', background: coords.color, borderRadius: '50%', boxShadow: `0 0 20px ${coords.color}`, border: '2px solid white' }}></div>
                          <div className="data-mono" style={{ fontSize: '0.55rem', color: 'white', background: 'rgba(0,0,0,0.85)', padding: '3px 7px', border: `1px solid ${coords.color}`, position: 'absolute', top: '15px', left: '-10px', whiteSpace: 'nowrap', borderRadius: '2px', zIndex: 100 }}>
                            {source.toUpperCase()} <span style={{ color: 'var(--accent-green)', fontSize: '0.5rem' }}>[ONLINE]</span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>

            {/* Floating Telemetry Stats */}
            <div style={{
              position: 'absolute',
              bottom: '1.5rem',
              left: '2rem',
              display: 'flex',
              gap: '2.5rem',
              background: 'rgba(5, 5, 10, 0.98)',
              padding: '1rem 2.5rem',
              border: '1px solid var(--accent-cyan)',
              borderLeft: '4px solid var(--accent-cyan)',
              backdropFilter: 'blur(15px)',
              borderRadius: '4px',
              zIndex: 1000,
              boxShadow: '0 0 40px rgba(0, 242, 255, 0.15)',
              pointerEvents: 'none'
            }} className="mobile-telemetry-hide">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                <span className="data-mono" style={{ fontSize: '0.55rem', color: 'var(--accent-cyan)', letterSpacing: '2px', opacity: 0.8 }}>GLOBAL_THREAT_LEVEL</span>
                <span className="data-mono" style={{ fontSize: '1.1rem', fontWeight: 900, color: globalIntel.threatLevel === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-cyan)', textShadow: '0 0 10px rgba(0, 242, 255, 0.4)' }}>
                  {globalIntel.threatLevel || 'STABLE'}
                </span>
              </div>
              <div style={{ width: '1px', background: 'rgba(0, 242, 255, 0.2)' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                <span className="data-mono" style={{ fontSize: '0.55rem', color: 'var(--accent-cyan)', letterSpacing: '2px', opacity: 0.8 }}>ACTIVE_SATELLITES</span>
                <span className="data-mono" style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white' }}>12/12 <span style={{ fontSize: '0.6rem', color: 'var(--accent-green)' }}>ONLINE</span></span>
              </div>
            </div>
          </div>

          {/* Sidebar Analytics Panel */}
          <div style={{ background: '#08080a', borderLeft: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '1.5rem' }} className="mobile-side-scroll">
            <div style={{ marginBottom: '2rem' }}>
              <div className="data-mono" style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', letterSpacing: '2px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={14} /> LIVE_NODE_FEED
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                  <div className="data-mono" style={{ fontSize: '0.55rem', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>ENCRYPTED_DATA_FLOW</div>
                  <div className="data-mono" style={{ fontSize: '1rem', color: 'white', fontWeight: 700 }}>{globalIntel.totalTraffic}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                  <div className="data-mono" style={{ fontSize: '0.55rem', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>ONION_NODES_DETECTION</div>
                  <div className="data-mono" style={{ fontSize: '1rem', color: 'white', fontWeight: 700 }}>{globalIntel.torNodes?.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Tactical Terminal Inside Globe View */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="data-mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>NETWORK_ENGINE_LOGS</span>
                <span className="data-mono animate-pulse" style={{ fontSize: '0.5rem', color: 'var(--accent-cyan)' }}>REAL_TIME_SYNC</span>
              </div>

              <div className="tactical-scrollbar" style={{
                flex: 1,
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '4px',
                padding: '0.75rem',
                overflowY: 'auto',
                fontFamily: 'JetBrains Mono',
                fontSize: '0.6rem',
                lineHeight: '1.4'
              }}>
                {(Array.isArray(findings) ? findings : []).length > 0 ? findings.slice(0, 20).map((f: any, i: number) => {
                  const nodeIds = ['NODE_NA_01', 'NODE_EU_04', 'NODE_AF_09', 'NODE_AS_07', 'NODE_SA_03', 'NODE_OC_02'];
                  const sourceNode = nodeIds[Math.floor(Math.random() * nodeIds.length)];
                  const targetNode = nodeIds[Math.floor(Math.random() * nodeIds.length)];

                  let color = 'rgba(255,255,255,0.7)';
                  if (f?.severity === 'CRITICAL') color = 'var(--accent-red)';
                  if (f?.severity === 'HIGH') color = '#f59e0b';

                  return (
                    <div key={i} className="animate-in" style={{ marginBottom: '0.6rem', borderLeft: `2px solid ${color}`, paddingLeft: '0.5rem', color: color }}>
                      <span style={{ opacity: 0.4, color: 'white' }}>[{f?.discovered_at ? new Date(f.discovered_at).toLocaleTimeString([], { hour12: false }) : '00:00:00'}]</span>
                      <div style={{ fontSize: '0.55rem', color: 'var(--accent-cyan)', marginTop: '2px' }}>
                        {sourceNode} &raquo; {targetNode} // IP: {Math.floor(Math.random() * 255)}.{Math.floor(Math.random() * 255)}.{Math.floor(Math.random() * 255)}.1
                      </div>
                      <div style={{ opacity: 0.8, marginTop: '1px' }}>{f?.source} INTERCEPTED: {f?.data_type}</div>
                    </div>
                  );
                }) : (
                  <div style={{ color: 'var(--text-dim)', textAlign: 'center', marginTop: '2rem' }}>[ INITIALIZING_DATA_MAPPING_... ]</div>
                )}
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <span className="data-mono" style={{ fontSize: '0.5rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>SHADOWSCAN_CORE_PROTOCOL_v4.2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Header = ({ onOpenProfile, onOpenGlobe, isConnected, onToggleSidebar }: { onOpenProfile: () => void, onOpenGlobe: () => void, isConnected: boolean, onToggleSidebar: () => void }) => {
  const { toggleConsole, performance, alerts, user, findings, stats } = useFindingsStore();
  const navigate = useNavigate();
  const [lastScrollY, setLastScrollY] = React.useState(0);
  const [headerVisible, setHeaderVisible] = React.useState(true);

  React.useEffect(() => {
    const contentArea = document.querySelector('.content-area');
    if (!contentArea) return;

    const handleScroll = () => {
      const currentScrollY = contentArea.scrollTop;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    contentArea.addEventListener('scroll', handleScroll, { passive: true });
    return () => contentArea.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className={`header-wrapper ${headerVisible ? 'visible' : 'hidden'}`} style={{ 
      transform: headerVisible ? 'translateY(0)' : 'translateY(-100%)',
      opacity: headerVisible ? 1 : 0,
      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <header className="stealth-command-bar">
        {/* SECTION 1: System Node & Connectivity */}
        <div className="header-section">
          <button className="mobile-menu-btn" onClick={onToggleSidebar}>
            <Menu size={24} />
          </button>
          <div className="header-brand-tactical">
            <ShieldAlert size={20} style={{ color: 'var(--accent-cyan)', filter: 'drop-shadow(0 0 8px rgba(0, 242, 255, 0.4))' }} />
          </div>
          <div className="status-nexus desktop-only" style={{ background: 'rgba(0, 242, 255, 0.05)', border: '1px solid rgba(0, 242, 255, 0.1)' }}>
            <div className={`status-node ${isConnected ? 'active' : 'offline'}`} />
            <span className="status-text desktop-only" style={{ color: isConnected ? 'var(--accent-cyan)' : 'var(--accent-red)' }}>{isConnected ? 'NEXUS_LINK: ACTIVE' : 'UPLINK: FAILED'}</span>
          </div>
        </div>

        {/* SECTION 2: Center Telemetry Hub */}
        <div className="header-telemetry-hub" style={{ flex: 1, margin: '0 1rem', justifyContent: 'center', gap: '2rem' }}>
          <div className="telemetry-item">
            <Activity size={14} style={{ color: 'var(--accent-green)' }} />
            <span className="desktop-only" style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginRight: '4px' }}>INTEL:</span>
            <span>{stats?.totalFindings || 0}</span>
          </div>
          <div className="telemetry-divider desktop-only" />
          <div className="telemetry-item desktop-only">
            <Bell size={14} style={{ color: 'var(--accent-red)' }} />
            <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginRight: '4px' }}>ALERTS:</span>
            <span>{stats?.totalAlerts || 0}</span>
          </div>
        </div>

        {/* SECTION 3: System Controls & Profile */}
        <div className="header-controls">
          <button className="control-btn terminal-toggle mobile-flex" onClick={toggleConsole} title="SYSTEM_TERMINAL">
            <Terminal size={16} />
          </button>
          <button className="control-btn mobile-flex" onClick={onOpenGlobe} title="GLOBAL_GRID">
            <Globe size={16} />
          </button>
          <button className="control-btn" onClick={() => navigate('/alerts')} title="THREAT_ALERTS">
            <Bell size={16} />
            {(stats?.totalAlerts || 0) > 0 && <span className="header-badge">{stats.totalAlerts}</span>}
          </button>
          
          <div className="header-divider desktop-only" style={{ margin: '0 0.25rem', opacity: 0.2 }}></div>
          
          <div className="user-profile-capsule" onClick={onOpenProfile}>
            <div className="user-details desktop-only" style={{ marginRight: '0.5rem' }}>
              <span className="user-name" style={{ fontSize: '0.7rem' }}>{user.name.split(' ')[0]}</span>
            </div>
            <div className="user-avatar-premium" style={{ 
                width: '32px',
                height: '32px',
                backgroundImage: user.profilePic ? `url(${user.profilePic})` : 'none',
                backgroundColor: user.profilePic ? 'transparent' : 'var(--accent-cyan)',
                fontSize: '0.7rem'
            }}>
              {!user.profilePic && user.avatar}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

// Global Error Boundary Component
class SystemErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('CRITICAL_SYSTEM_CRASH:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '4rem', textAlign: 'center', background: '#0a0a0f', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldAlert size={64} style={{ color: 'var(--accent-red)', marginBottom: '2rem' }} />
          <h2 className="data-mono" style={{ color: 'white', marginBottom: '1rem' }}>SYSTEM_KERNEL_PANIC</h2>
          <p className="text-dim" style={{ maxWidth: '500px', marginBottom: '2rem' }}>A critical exception has occurred in the surveillance interface. Data integrity remains intact.</p>
          <button
            className="print-btn"
            style={{ background: 'var(--accent-cyan)', color: 'black' }}
            onClick={() => window.location.reload()}
          >
            REBOOT_INTERFACE
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const { isConsoleOpen, toggleConsole, findings, stats, setFindings, setAlerts, updateStats, user, updateUser, performance } = useFindingsStore();
  const [showProfileModal, setShowProfileModal] = React.useState(false);
  const [showGlobePanel, setShowGlobePanel] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const location = useLocation();

  // Close sidebar on navigation
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  // Initialize Real-time Data Pipeline
  const isConnected = useSocket();

  const [terminalPos, setTerminalPos] = React.useState({ x: 0, y: 0 });
  const [isDraggingTerminal, setIsDraggingTerminal] = React.useState(false);
  const [terminalDragOffset, setTerminalDragOffset] = React.useState({ x: 0, y: 0 });

  const handleTerminalDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDraggingTerminal(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setTerminalDragOffset({
      x: clientX - terminalPos.x,
      y: clientY - terminalPos.y
    });
  };

  const handleGlobalMove = React.useCallback((e: MouseEvent | TouchEvent) => {
    if (isDraggingTerminal) {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setTerminalPos({
        x: clientX - terminalDragOffset.x,
        y: clientY - terminalDragOffset.y
      });
    }
  }, [isDraggingTerminal, terminalDragOffset]);

  const handleGlobalEnd = React.useCallback(() => {
    setIsDraggingTerminal(false);
  }, []);

  React.useEffect(() => {
    if (isDraggingTerminal) {
      window.addEventListener('mousemove', handleGlobalMove);
      window.addEventListener('mouseup', handleGlobalEnd);
      window.addEventListener('touchmove', handleGlobalMove);
      window.addEventListener('touchend', handleGlobalEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalEnd);
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('touchend', handleGlobalEnd);
    };
  }, [isDraggingTerminal, handleGlobalMove, handleGlobalEnd]);

  React.useEffect(() => {
    const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');
    
    fetch(`${API_BASE}/api/v1/findings`)
      .then(res => res.json())
      .then(json => {
        if (json.success) setFindings(json.data);
      })
      .catch(err => console.error('Failed to fetch initial findings:', err));

    fetch(`${API_BASE}/api/v1/alerts`)
      .then(res => res.json())
      .then(json => {
        if (json.success) setAlerts(json.data);
      })
      .catch(err => console.error('Failed to fetch initial alerts:', err));

    fetch(`${API_BASE}/api/v1/stats`)
      .then(res => res.json())
      .then(json => {
        if (json.success) updateStats(json.data);
      })
      .catch(err => console.error('Failed to fetch initial stats:', err));
  }, [setFindings, setAlerts, updateStats]);

  return (
    <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && <div className="mobile-overlay" onClick={() => setIsSidebarOpen(false)} />}
      <div className="main-viewport">
        <Header 
          onOpenProfile={() => setShowProfileModal(true)} 
          onOpenGlobe={() => setShowGlobePanel(true)} 
          isConnected={isConnected} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="content-area">
          <div style={{ flex: 1 }}>
            <SystemErrorBoundary>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/findings" element={<Findings />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/investigation" element={<Investigation />} />
                <Route path="/watchlist" element={<Watchlist />} />
                <Route path="/threat-actors" element={<ThreatActors />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/guide" element={<Guide />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Dashboard />} />
              </Routes>
            </SystemErrorBoundary>
          </div>

            {/* Tactical Copyright Footer (Clean Floating Style) */}
            <footer className="tactical-footer">
              <div className="data-mono" style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <ShieldCheck size={14} style={{ color: 'var(--accent-cyan)' }} />
                <span style={{ letterSpacing: '3px', fontWeight: 900, color: 'white' }}>SHADOWSCAN PRO</span>
                <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>2026</span>
                <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
                <span style={{ color: 'var(--text-dim)', letterSpacing: '1px' }}>OPERATIONAL_INTELLIGENCE_LATTICE</span>
              </div>
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div className="status-dot animate-pulse" style={{ width: '6px', height: '6px', background: '#00ff88', boxShadow: '0 0 10px #00ff88' }}></div>
                  <span className="data-mono" style={{ fontSize: '0.6rem', color: 'white', fontWeight: 700 }}>SECURE_STATION</span>
                </div>
                <div className="data-mono" style={{ fontSize: '0.6rem', color: 'var(--accent-cyan)', background: 'rgba(0, 242, 255, 0.05)', padding: '4px 12px', borderRadius: '4px', border: '1px solid rgba(0, 242, 255, 0.1)', fontWeight: 900 }}>
                  v2.4.1_GOLD_MASTER
                </div>
              </div>
            </footer>
          </div>
        </div>

        {/* Kali Linux Style System Tactical Terminal Overlay */}
        {isConsoleOpen && (
          <div className="kali-terminal slide-in tactical-terminal-draggable" style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            transform: `translate(${terminalPos.x}px, ${terminalPos.y}px)`,
            width: '650px',
            height: '450px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: 'rgba(10, 10, 12, 0.98)',
            border: '1px solid rgba(0, 242, 255, 0.4)',
            boxShadow: '0 30px 60px rgba(0,0,0,0.9), 0 0 20px rgba(0, 242, 255, 0.1)',
            borderRadius: '4px',
            backdropFilter: 'blur(10px)',
            touchAction: 'none'
          }}>
            <div 
              className="terminal-header" 
              onMouseDown={handleTerminalDragStart}
              onTouchStart={handleTerminalDragStart}
              style={{ 
                padding: '0.6rem 1rem', 
                background: '#1a1a1c', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                cursor: isDraggingTerminal ? 'grabbing' : 'grab'
              }}
            >
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }}></div>
                </div>
                <span className="data-mono" style={{ fontSize: '0.65rem', marginLeft: '1rem', color: 'var(--text-secondary)', letterSpacing: '1px', pointerEvents: 'none' }}>
                  <Terminal size={10} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                  root@shadowscan: /usr/bin/tactical_monitor
                </span>
              </div>
              <X size={16} style={{ cursor: 'pointer', color: 'var(--text-dim)' }} onClick={toggleConsole} className="hover-cyan" />
            </div>

            <div className="data-mono tactical-scrollbar" style={{ padding: '1.5rem', flex: 1, fontSize: '0.75rem', color: '#00ff41', overflowY: 'auto', background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0, 242, 255, 0.02) 100%)' }}>
              <div style={{ color: '#00ccff', marginBottom: '1.25rem', fontSize: '0.8rem', opacity: 0.9 }}>
                <span style={{ color: '#ff3e3e' }}>┌──(</span>
                <span style={{ color: 'white', fontWeight: 800 }}>root㉿shadowscan</span>
                <span style={{ color: '#ff3e3e' }}>)-[</span>
                <span style={{ color: 'white' }}>~</span>
                <span style={{ color: '#ff3e3e' }}>]</span><br />
                <span style={{ color: '#ff3e3e' }}>└─$</span> <span style={{ color: '#00ff41' }}>shadow-top --telemetry --live</span>
              </div>

              {/* Real-time Hardware Analytics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.25rem' }}>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.6rem', letterSpacing: '1px', marginBottom: '0.5rem' }}>CORE_PROCESSOR_LOAD</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${performance?.cpuUsage || 0}%`, height: '100%', background: 'var(--accent-cyan)', boxShadow: '0 0 10px var(--accent-cyan)', transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900, minWidth: '35px', color: 'white' }}>{performance?.cpuUsage || 0}%</span>
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.6rem', letterSpacing: '1px', marginBottom: '0.5rem' }}>VOLATILE_MEMORY_SYC</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${performance?.memUsage || 0}%`, height: '100%', background: '#8b5cf6', boxShadow: '0 0 10px #8b5cf6', transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900, minWidth: '35px', color: 'white' }}>{performance?.memUsage || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Live Logs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ color: '#666', fontSize: '0.65rem' }}>[ SYSTEM_KERNEL_LOGS ]</div>
                {findings.slice(0, 5).map((f: any, i: number) => (
                  <div key={i} className="animate-in" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>
                    <span style={{ color: 'var(--accent-cyan)', opacity: 0.6 }}>[{new Date(f.discovered_at).toLocaleTimeString([], { hour12: false })}]</span>
                    <span style={{ color: f.severity === 'CRITICAL' ? 'var(--accent-red)' : '#00ff41', marginLeft: '0.5rem' }}>[{f.severity}]</span>
                    <span style={{ marginLeft: '0.5rem' }}>{f.source} &raquo; INTERCEPTED_FINDING_{f.id?.substring(0, 6)}</span>
                  </div>
                ))}

                <div style={{ marginTop: '1rem' }}>
                  <div><span style={{ color: '#aaa' }}>KERNEL:</span> {performance?.kernel || 'SHADOW_CORE_v4.2'}</div>
                  <div><span style={{ color: '#aaa' }}>UPTIME:</span> {performance ? Math.floor(performance.uptime / 3600) + 'h ' + Math.floor((performance.uptime % 3600) / 60) + 'm' : 'SYNCHRONIZING...'}</div>
                  <div style={{ color: 'var(--accent-cyan)', marginTop: '0.5rem' }}>[SUCCESS] Tactical uplink established via secure proxy.</div>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
                    <span style={{ color: '#00ff41' }}>$</span>
                    <div className="status-dot animate-pulse" style={{ width: '8px', height: '14px', background: '#00ff41', marginLeft: '0.5rem', borderRadius: '1px' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {showProfileModal && <ProfileModal user={user} updateUser={updateUser} onClose={() => setShowProfileModal(false)} stats={stats} />}
      {showGlobePanel && <GlobePanel onClose={() => setShowGlobePanel(false)} />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
