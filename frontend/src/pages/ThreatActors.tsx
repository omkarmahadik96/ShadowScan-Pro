import React, { useState, useEffect } from 'react';
import {
  Users,
  MapPin,
  Activity,
  Shield,
  ChevronRight,
  Search,
  Crosshair,
  ShieldAlert
} from 'lucide-react';
import './ThreatActors.css';
import { useFindingsStore } from '../store/findingsStore';

const ThreatActors = () => {
  const [actors, setActors] = useState<any[]>([
    {
      id: 'TA-ALPHA',
      name: 'Nexus Syndicate',
      aliases: ['NX_Group', 'NightOwl'],
      origin: 'Eastern Europe',
      active: 'Since 2024',
      motivation: 'Data Exfiltration / Ransom',
      targets: ['Technology', 'Healthcare'],
      severity: 'CRITICAL',
      status: 'Active'
    },
    {
      id: 'TA-BETA',
      name: 'Cobalt Mirage',
      aliases: ['Mirage_Crew', 'Desert_Fox'],
      origin: 'Middle East',
      active: 'Since 2022',
      motivation: 'Espionage',
      targets: ['Government', 'Defense'],
      severity: 'HIGH',
      status: 'Monitoring'
    },
    {
      id: 'TA-GAMMA',
      name: 'Labyrinth Chasm',
      aliases: ['LC_Fin', 'Maze_Runners'],
      origin: 'Asia Pacific',
      active: 'Since 2023',
      motivation: 'Financial Gain',
      targets: ['Banking', 'Crypto Exchanges'],
      severity: 'HIGH',
      status: 'Active'
    },
    {
      id: 'TA-DELTA',
      name: 'Ghost Protocol',
      aliases: ['GP_Stealth', 'Spectre'],
      origin: 'Unknown',
      active: 'Since 2021',
      motivation: 'Intelligence Gathering',
      targets: ['Energy Sector', 'Infrastructure'],
      severity: 'CRITICAL',
      status: 'Infiltration Detected'
    },
    {
      id: 'TA-EPSILON',
      name: 'Void Spider',
      aliases: ['VS_Ransom', 'Spider_Net'],
      origin: 'Global / Distributed',
      active: 'Since 2024',
      motivation: 'Ransomware-as-a-Service',
      targets: ['Education', 'Retail'],
      severity: 'MEDIUM',
      status: 'Dormant'
    }
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchActors = () => {
      const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');
      fetch(`${API_BASE}/api/v1/adversaries`)
        .then(res => res.json())
        .then(json => {
          if (json.success && json.data && json.data.length > 0) {
            setActors(json.data);
          }
        })
        .catch(err => console.warn('Live intel sync failed, maintaining local cache.', err));
    };

    fetchActors();
    const interval = setInterval(fetchActors, 5000); // Poll every 5 seconds for LIVE detection
    return () => clearInterval(interval);
  }, []);

  const [selectedActor, setSelectedActor] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeCountermeasure, setActiveCountermeasure] = useState<string | null>(null);
  const [countermeasureStage, setCountermeasureStage] = useState<'idle' | 'initializing' | 'analyzing' | 'deploying' | 'completed'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const countermeasureTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const { findings } = useFindingsStore();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedActor(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      if (countermeasureTimeoutRef.current) clearTimeout(countermeasureTimeoutRef.current);
    };
  }, []);

  const handleInitializeCountermeasure = (actor: any) => {
    if (countermeasureTimeoutRef.current) clearTimeout(countermeasureTimeoutRef.current);
    
    const targetActorId = actor.id;
    const targetActorName = actor.name;
    
    setActiveCountermeasure(targetActorName);
    setCountermeasureStage('initializing');

    let currentLogs = ['[SYSTEM] Initializing defensive protocol...', `[TARGET] ${targetActorName.toUpperCase()}`];
    setLogs(currentLogs);

    setTimeout(() => {
      setCountermeasureStage('analyzing');
      currentLogs = [...currentLogs, '[SCAN] Identifying attack vectors...', '[SCAN] Mapping infrastructure...'];
      setLogs(currentLogs);
    }, 2000);

    setTimeout(() => {
      currentLogs = [...currentLogs, '[ANALYSIS] Packet signatures matched.', '[ANALYSIS] Origin IP traced to encrypted node.'];
      setLogs(currentLogs);
    }, 4500);

    setTimeout(() => {
      setCountermeasureStage('deploying');
      currentLogs = [...currentLogs, '[ACTION] Injecting neural snare...', '[ACTION] Disrupting botnet command-and-control...'];
      setLogs(currentLogs);
    }, 7000);

    setTimeout(() => {
      setCountermeasureStage('completed');
      currentLogs = [...currentLogs, '[SUCCESS] Threat neutralized.', '[STATUS] Monitoring for resurgence.'];
      setLogs(currentLogs);

      // SAVE TO BACKEND - Real Operation
      const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');
      fetch(`${API_BASE}/api/v1/countermeasures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId: targetActorId || 'UNKNOWN',
          actorName: targetActorName,
          logs: currentLogs,
          status: 'SUCCESS'
        })
      })
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            // Only update history if the current modal is still showing THIS actor
            if (selectedActor?.id === targetActorId) {
              setHistory(prev => [json.data, ...prev]);
            }
          }
        })
        .catch(err => console.error('Failed to save countermeasure logs:', err));
    }, 10000);

    countermeasureTimeoutRef.current = setTimeout(() => {
      setActiveCountermeasure(null);
      setCountermeasureStage('idle');
      setLogs([]);
    }, 14000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'var(--accent-red)';
      case 'HIGH': return 'var(--accent-orange)';
      case 'MEDIUM': return 'var(--accent-cyan)';
      default: return 'var(--text-dim)';
    }
  };

  const filteredActors = actors.filter(actor =>
    (actor.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (actor.origin || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (selectedActor) {
      const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');
      fetch(`${API_BASE}/api/v1/countermeasures/actor/${selectedActor.id}`)
        .then(res => res.json())
        .then(json => {
          if (json.success) setHistory(json.data);
        });
    }
  }, [selectedActor]);

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {/* Main Animated Content */}
      <div className="animate-in">
        <div className="page-title-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">Threat Actor Intelligence</h1>
            <p className="page-subtitle">Profiles and activity tracking of known malicious groups and independent actors.</p>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
            <Search size={18} style={{ color: 'var(--text-dim)', marginRight: '0.75rem' }} />
            <input
              type="text"
              style={{ background: 'transparent', border: 'none', color: 'white', padding: '0.75rem 0', width: '100%', outline: 'none', fontSize: '0.875rem' }}
              placeholder="Search active threat actors or origin regions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Loading & Empty State Handling */}
        {!actors || actors.length === 0 ? (
          <div className="glass" style={{ padding: '4rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
            <Activity size={48} className="animate-pulse" style={{ color: 'var(--accent-cyan)', marginBottom: '1.5rem', margin: '0 auto' }} />
            <h3 className="data-mono" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>INTEL_UPLINK_PENDING</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Synchronizing with the global threat matrix. If this persists, the database may be empty or the backend is offline.</p>
            <button 
              onClick={() => window.location.reload()}
              style={{ padding: '0.75rem 2rem', background: 'var(--accent-cyan)', color: 'black', border: 'none', borderRadius: '4px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Orbitron' }}
            >
              SYNC_LATEST_INTEL
            </button>
          </div>
        ) : filteredActors.length === 0 ? (
          <div className="glass" style={{ padding: '4rem', textAlign: 'center' }}>
            <Search size={48} style={{ color: 'var(--text-dim)', marginBottom: '1.5rem', margin: '0 auto' }} />
            <h3 className="data-mono">NO_MATCH_FOUND</h3>
            <p style={{ color: 'var(--text-secondary)' }}>No threat actors match your current search criteria.</p>
          </div>
        ) : (
          <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
            {filteredActors.map(actor => (
              <div key={actor.id} className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: getSeverityColor(actor.severity) }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="data-mono" style={{ fontSize: '0.7rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                    {actor.id}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: actor.status === 'Active' ? 'var(--accent-red)' : 'var(--accent-orange)', boxShadow: `0 0 10px ${actor.status === 'Active' ? 'var(--accent-red)' : 'var(--accent-orange)'}` }}></div>
                    <span className="data-mono" style={{ fontSize: '0.65rem', color: 'white' }}>{actor.status.toUpperCase()}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ color: 'var(--text-dim)', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '50%', border: `1px solid ${getSeverityColor(actor.severity)}` }}>
                    <Users size={24} style={{ color: getSeverityColor(actor.severity) }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.25rem 0', fontFamily: 'Orbitron' }}>{actor.name}</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {(actor.aliases || []).map((a: string) => (
                        <span key={a} className="data-mono" style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', background: 'rgba(0, 242, 255, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>@{a}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}><MapPin size={14} /> Origin</span>
                    <span className="data-mono" style={{ fontSize: '0.8rem' }}>{actor.origin || 'Unknown'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}><Activity size={14} /> Activity</span>
                    <span className="data-mono" style={{ fontSize: '0.8rem' }}>{actor.active || 'Unknown'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}><Shield size={14} /> Risk Level</span>
                    <span className="data-mono" style={{ fontSize: '0.8rem', color: getSeverityColor(actor.severity), fontWeight: 800 }}>{actor.severity}</span>
                  </div>
                </div>

                <div>
                  <h4 className="data-mono" style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Crosshair size={14} /> TARGET SECTORS
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {(actor.targets || []).map((t: string) => (
                      <span key={t} style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>{t}</span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedActor(actor)}
                  style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: '1px solid var(--border-light)', color: 'white', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
                  className="glow-cyan-hover"
                >
                  <span className="data-mono" style={{ fontSize: '0.75rem' }}>VIEW_FULL_PROFILE</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALS - Placed outside animate-in to prevent fixed positioning issues */}

      {/* Countermeasure Overlay */}
      {activeCountermeasure && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.9)',
          backdropFilter: 'blur(20px)',
          zIndex: 2000,
          color: countermeasureStage === 'analyzing' ? 'var(--accent-cyan)' : countermeasureStage === 'completed' ? 'var(--accent-green)' : 'var(--accent-red)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div className="glass" style={{
            padding: '2rem',
            border: `1px solid ${countermeasureStage === 'analyzing' ? 'var(--accent-cyan)' : countermeasureStage === 'completed' ? 'var(--accent-green)' : 'var(--accent-red)'}`,
            boxShadow: `0 0 50px ${countermeasureStage === 'analyzing' ? 'rgba(0, 242, 255, 0.2)' : 'rgba(255, 0, 60, 0.2)'}`,
            fontFamily: 'Orbitron',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            minWidth: '500px',
            maxWidth: '600px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <ShieldAlert size={24} className={countermeasureStage !== 'completed' ? "animate-pulse" : ""} />
                <span style={{ letterSpacing: '2px', fontWeight: 700, fontSize: '1rem' }}>
                  {countermeasureStage.toUpperCase()}: {activeCountermeasure.toUpperCase()}
                </span>
              </div>
              <div className="data-mono" style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                {new Date().toLocaleTimeString()}
              </div>
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.8)',
              padding: '1.5rem',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.05)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              height: '220px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
            }}>
              {logs.map((log, i) => (
                <div key={i} style={{
                  color: log.includes('SUCCESS') ? 'var(--accent-green)' : log.includes('ERROR') ? 'var(--accent-red)' : log.includes('[SCAN]') ? 'var(--accent-cyan)' : 'inherit',
                  borderLeft: `2px solid ${log.includes('SUCCESS') ? 'var(--accent-green)' : log.includes('[SCAN]') ? 'var(--accent-cyan)' : 'transparent'}`,
                  paddingLeft: '0.75rem',
                  marginBottom: '2px'
                }}>
                  <span style={{ opacity: 0.3, marginRight: '0.75rem', fontSize: '0.7rem' }}>{new Date().toLocaleTimeString().split(' ')[0]}</span>
                  {log}
                </div>
              ))}
              {countermeasureStage !== 'completed' && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', paddingLeft: '0.75rem' }}>
                  <span style={{ width: '8px', height: '14px', background: 'currentColor', animation: 'blink 1s infinite' }}></span>
                  <span style={{ opacity: 0.5, fontSize: '0.75rem' }}>Awaiting system response...</span>
                </div>
              )}
            </div>

            <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.05)', position: 'relative', overflow: 'hidden', borderRadius: '2px' }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                background: countermeasureStage === 'analyzing' ? 'var(--accent-cyan)' : countermeasureStage === 'completed' ? 'var(--accent-green)' : 'var(--accent-red)',
                boxShadow: `0 0 10px ${countermeasureStage === 'analyzing' ? 'var(--accent-cyan)' : 'var(--accent-green)'}`,
                width: countermeasureStage === 'initializing' ? '25%' : countermeasureStage === 'analyzing' ? '60%' : countermeasureStage === 'deploying' ? '85%' : '100%',
                transition: 'width 2s ease-in-out, background 0.5s'
              }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="data-mono" style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.4)', textAlign: 'center' }}>
                {countermeasureStage === 'completed' ? 'THREAT_NEUTRALIZED // LOGS_SAVED' : 'EXECUTING_CYBER_DEFENSE_ARRAY // UNLOCK_CIPHER_BETA'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {selectedActor && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedActor(null);
          }}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
        >
          <div className="glass" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem', position: 'relative', border: '1px solid rgba(0, 242, 255, 0.2)' }}>
            <button
              onClick={() => setSelectedActor(null)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', color: 'var(--accent-cyan)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.7rem' }}
              className="glow-cyan-hover"
            >
              [ ESC_CLOSE ]
            </button>

            <div className="actor-profile-header" style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
              <div style={{ color: 'var(--text-dim)', background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '12px', border: `1px solid ${getSeverityColor(selectedActor.severity)}`, flexShrink: 0 }}>
                <Users size={48} style={{ color: getSeverityColor(selectedActor.severity) }} />
              </div>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div className="data-mono" style={{ color: getSeverityColor(selectedActor.severity), fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>{selectedActor.id} // THREAT_LEVEL: {selectedActor.severity}</div>
                <h2 className="actor-modal-title" style={{ fontSize: '2.5rem', fontFamily: 'Orbitron', margin: '0 0 1rem 0' }}>{selectedActor.name}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6' }}>{selectedActor.motivation}. Primarily targeting {selectedActor.targets.join(' and ')} across {selectedActor.origin}.</p>
              </div>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              <div className="glass" style={{ padding: '1.5rem' }}>
                <h3 className="data-mono" style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--accent-cyan)' }}>TACTICAL_OBSERVATIONS</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="text-dim">Status</span>
                    <div style={{ position: 'relative' }}>
                      <select 
                        disabled={isUpdating}
                        value={selectedActor.status} 
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          setIsUpdating(true);
                          try {
                            const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');
                            const res = await fetch(`${API_BASE}/api/v1/adversaries/${selectedActor.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: newStatus })
                            });
                            const json = await res.json();
                            if (json.success) {
                              setActors(actors.map(a => a.id === selectedActor.id ? { ...a, status: newStatus } : a));
                              setSelectedActor({ ...selectedActor, status: newStatus });
                            }
                          } catch (err) { console.error('Failed to update status:', err); }
                          setIsUpdating(false);
                        }}
                        style={{ 
                          background: '#0a0a0f', 
                          border: '1px solid var(--border-light)', 
                          color: selectedActor.status === 'Neutralized' ? 'var(--accent-green)' : 'var(--accent-red)', 
                          padding: '0.2rem 0.5rem',
                          fontSize: '0.7rem', 
                          outline: 'none', 
                          cursor: isUpdating ? 'wait' : 'pointer',
                          opacity: isUpdating ? 0.5 : 1
                        }}
                        className="data-mono"
                      >
                        <option value="Active" style={{ background: '#0a0a0f', color: 'white' }}>ACTIVE</option>
                        <option value="Monitoring" style={{ background: '#0a0a0f', color: 'white' }}>MONITORING</option>
                        <option value="Infiltration Detected" style={{ background: '#0a0a0f', color: 'white' }}>INFILTRATED</option>
                        <option value="Dormant" style={{ background: '#0a0a0f', color: 'white' }}>DORMANT</option>
                        <option value="Neutralized" style={{ background: '#0a0a0f', color: 'white' }}>NEUTRALIZED</option>
                      </select>
                      {isUpdating && <div className="animate-pulse" style={{ position: 'absolute', right: '-2rem', top: '2px', fontSize: '0.5rem', color: 'var(--accent-cyan)' }}>SYNC...</div>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-dim">Last Known Activity</span>
                    <span className="data-mono" style={{ color: 'var(--accent-cyan)' }}>{selectedActor.last_seen ? new Date(selectedActor.last_seen).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-dim">Known TTPs</span>
                    <span className="data-mono">SQLi, Phishing, Ransom</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-dim">Infrastructure</span>
                    <span className="data-mono">Distributed Botnet</span>
                  </div>
                </div>
              </div>

              <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <h3 className="data-mono" style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--accent-cyan)' }}>OPERATION_HISTORY</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }}>
                  {history && history.length > 0 ? (
                    history.map((h: any) => (
                      <div key={h.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>{h.id} // NEUTRALIZED</span>
                            <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>{new Date(h.timestamp).toLocaleString()}</span>
                          </div>
                          <span className="data-mono" style={{ color: 'var(--accent-green)', fontSize: '0.7rem' }}>{h.status}</span>
                        </div>
                        <div style={{
                          background: 'rgba(0,0,0,0.3)',
                          padding: '0.75rem',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontFamily: 'var(--font-mono)',
                          maxHeight: '100px',
                          overflowY: 'auto',
                          border: '1px solid rgba(255,255,255,0.02)'
                        }}>
                          {h.logs.map((log: string, idx: number) => (
                            <div key={idx} style={{
                              color: log.includes('SUCCESS') ? 'var(--accent-green)' : log.includes('[SCAN]') ? 'var(--accent-cyan)' : 'var(--text-dim)',
                              marginBottom: '2px'
                            }}>{log}</div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-dim data-mono" style={{ fontSize: '0.8rem' }}>[ NO PREVIOUS OPERATIONS RECORDED ]</div>
                  )}
                </div>
              </div>
            </div>

            <div className="actor-modal-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleInitializeCountermeasure(selectedActor)}
                style={{
                  flex: '1 1 300px',
                  padding: '1rem',
                  background: 'rgba(255, 0, 60, 0.1)',
                  border: '1px solid var(--accent-red)',
                  color: 'var(--accent-red)',
                  fontWeight: 700,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'Orbitron',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem'
                }}
                className="glow-red-hover"
              >
                <ShieldAlert size={18} />
                INITIALIZE_COUNTERMEASURES
              </button>
              <button style={{ flex: '1 1 300px', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', color: 'white', fontWeight: 700, borderRadius: '4px', cursor: 'pointer', fontFamily: 'Orbitron' }} onClick={() => setSelectedActor(null)}>BACK_TO_INTEL_DB</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreatActors;
