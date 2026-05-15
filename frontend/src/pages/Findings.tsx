import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  ShieldAlert, 
  Clock,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Trash2,
  X
} from 'lucide-react';
import { useFindingsStore } from '../store/findingsStore';
import './Findings.css';

const Findings = () => {
  const findings = useFindingsStore(state => state.findings || []);
  const { setFindings, searchTerm, setSearchTerm, clearFindings } = useFindingsStore();

  useEffect(() => {
    const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');
    fetch(`${API_BASE}/api/v1/findings`)
      .then(res => res.json())
      .then(json => {
        if (json.success) setFindings(json.data);
      })
      .catch(err => {
        console.warn('Backend unavailable, using offline cache for Findings:', err);
      });
  }, []);

  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleClearAll = async () => {
    try {
      const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');
      const res = await fetch(`${API_BASE}/api/v1/findings`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        clearFindings();
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      console.error('Failed to clear findings:', err);
    }
  };

  const search = (searchTerm || '').trim().toLowerCase();
  const filteredFindings = (findings || []).filter(f => {
    if (!f) return false;
    const matchesSearch = search === '' ||
      (f.source || '').toLowerCase().includes(search) ||
      (f.matched_value || '').toLowerCase().includes(search) ||
      (f.data_type || '').toLowerCase().includes(search) ||
      (f.severity || '').toLowerCase().includes(search);
      
    const matchesSeverity = filterSeverity === 'ALL' || (f.severity || '').toUpperCase() === filterSeverity;
    
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="animate-in">
      <div className="page-title-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Intelligence Database</h1>
          <p className="page-subtitle">Centralized repository of all intercepted data from the deep and dark web.</p>
        </div>
        <div className="status-pulse-badge">
          <div className="status-dot-pulse"></div>
          <span className="data-mono" style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', letterSpacing: '2px', fontWeight: 700 }}>ACTIVE_SURVEILLANCE</span>
        </div>
      </div>

      <div className="glass" style={{ padding: '1.5rem', marginBottom: '1.5rem', position: 'relative', zIndex: 100 }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
            <Search size={18} style={{ color: 'var(--text-dim)', marginRight: '0.75rem', flexShrink: 0 }} />
            <input 
              type="text" 
              style={{ background: 'transparent', border: 'none', color: 'white', padding: '0.75rem 0', width: '100%', outline: 'none', fontSize: '0.875rem' }}
              placeholder="Search findings by value, source, or type..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ position: 'relative' }}>
              <button 
                className="status-badge" 
                style={{ cursor: 'pointer', background: showFilters ? 'rgba(0, 242, 255, 0.1)' : 'rgba(255,255,255,0.03)', border: showFilters ? '1px solid var(--accent-cyan)' : '1px solid var(--border-light)' }}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} /> {filterSeverity === 'ALL' ? 'FILTERS' : filterSeverity}
              </button>
              {showFilters && (
                <div className="glass slide-in" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', padding: '0.5rem', width: '150px', zIndex: 150, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(level => (
                    <button 
                      key={level}
                      onClick={() => { setFilterSeverity(level); setShowFilters(false); }}
                      style={{ 
                        padding: '0.5rem', 
                        background: filterSeverity === level ? 'rgba(255,255,255,0.1)' : 'transparent', 
                        border: 'none', 
                        color: 'white', 
                        textAlign: 'left', 
                        cursor: 'pointer',
                        borderRadius: '4px',
                        fontSize: '0.75rem'
                      }}
                      className="data-mono"
                    >
                      {level}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button 
              className="status-badge" 
              style={{ cursor: 'pointer', background: 'rgba(255, 68, 68, 0.05)', border: '1px solid rgba(255, 68, 68, 0.2)', color: 'var(--accent-red)' }}
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={16} /> CLEAR HISTORY
            </button>
          </div>
        </div>
      </div>

      <div className="glass findings-table-container">
        <div className="findings-scroll-wrapper">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 0, zIndex: 10 }}>
                <th style={{ padding: '1.25rem', color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(10, 10, 15, 0.9)', backdropFilter: 'blur(5px)' }}>FINDING_ID</th>
                <th style={{ padding: '1.25rem', color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(10, 10, 15, 0.9)', backdropFilter: 'blur(5px)' }}>SOURCE</th>
                <th style={{ padding: '1.25rem', color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(10, 10, 15, 0.9)', backdropFilter: 'blur(5px)' }}>DATA_TYPE</th>
                <th style={{ padding: '1.25rem', color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(10, 10, 15, 0.9)', backdropFilter: 'blur(5px)' }}>SEVERITY</th>
                <th style={{ padding: '1.25rem', color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(10, 10, 15, 0.9)', backdropFilter: 'blur(5px)' }}>MATCHED_VALUE</th>
                <th style={{ padding: '1.25rem', color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(10, 10, 15, 0.9)', backdropFilter: 'blur(5px)' }}>DISCOVERED</th>
              </tr>
            </thead>
            <tbody>
              {filteredFindings.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                    <ShieldAlert size={32} style={{ opacity: 0.5, marginBottom: '1rem', margin: '0 auto' }} />
                    <p className="data-mono">No intelligence findings match your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredFindings.map((f) => (
                  <tr 
                    key={f.id} 
                    className={`finding-row ${Date.now() - new Date(f.discovered_at || Date.now()).getTime() < 10000 ? 'new-finding' : ''}`}
                    onClick={() => setSelectedFinding(f)}
                    style={{ borderBottom: '1px solid var(--border-light)', cursor: 'pointer', transition: 'background 0.2s' }}
                  >
                    <td data-label="FINDING_ID" className="data-mono" style={{ padding: '1.25rem', fontSize: '0.8125rem', color: 'var(--accent-cyan)' }}>{(f.id || 'UKN').slice(0, 12)}</td>
                    <td data-label="SOURCE" style={{ padding: '1.25rem', fontSize: '0.875rem' }}>
                      <span className="data-mono" style={{ color: 'var(--text-secondary)' }}>[{(f.source || 'UNKNOWN').toUpperCase()}]</span>
                    </td>
                    <td data-label="DATA_TYPE" style={{ padding: '1.25rem', fontSize: '0.875rem' }}>{f.dataType || f.data_type || 'INTEL_DATA'}</td>
                    <td data-label="SEVERITY" style={{ padding: '1.25rem' }}>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        fontSize: '0.7rem', 
                        fontWeight: 800,
                        background: f.severity === 'CRITICAL' ? 'rgba(255, 68, 68, 0.1)' : 'rgba(0, 242, 255, 0.1)',
                        color: f.severity === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-cyan)',
                        border: f.severity === 'CRITICAL' ? '1px solid rgba(255, 68, 68, 0.2)' : '1px solid rgba(0, 242, 255, 0.2)'
                      }}>
                        {f.severity || 'UNKNOWN'}
                      </span>
                    </td>
                    <td data-label="MATCHED_VALUE" className="data-mono" style={{ padding: '1.25rem', fontSize: '0.8125rem' }}>{f.matchedValue || f.matched_value || 'DIRECT_HIT'}</td>
                    <td data-label="DISCOVERED" className="data-mono" style={{ padding: '1.25rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {f.discoveredAt || f.discovered_at ? new Date(f.discoveredAt || f.discovered_at).toLocaleString() : 'Just now'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TACTICAL_INVESTIGATION_HUD */}
      {selectedFinding && (
        <div className="modal-overlay" onClick={() => setSelectedFinding(null)}>
          <div 
            className="modal-content-clean animate-slide-up" 
            style={{ maxWidth: '800px', borderTop: `4px solid ${selectedFinding.severity === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-cyan)'}` }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div>
                <div className="data-mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                  INTEL_ID: {selectedFinding.id?.slice(0,12) || 'N/A'} // {new Date(selectedFinding.discoveredAt || selectedFinding.discovered_at).toLocaleString()}
                </div>
                <h2 style={{ margin: 0, fontFamily: 'Orbitron', fontSize: '1.4rem', color: 'white', letterSpacing: '2px' }}>
                  {selectedFinding.dataType || selectedFinding.data_type || 'DATA_LEAK_IDENTIFIED'}
                </h2>
              </div>
              <div style={{ 
                background: selectedFinding.severity === 'CRITICAL' ? 'rgba(255, 68, 68, 0.1)' : 'rgba(0, 242, 255, 0.1)', 
                color: selectedFinding.severity === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-cyan)',
                padding: '0.6rem 1.2rem',
                borderRadius: '4px',
                border: `1px solid ${selectedFinding.severity === 'CRITICAL' ? 'rgba(255, 68, 68, 0.2)' : 'rgba(0, 242, 255, 0.2)'}`,
                fontFamily: 'JetBrains Mono',
                fontSize: '0.75rem',
                fontWeight: 900
              }}>
                {selectedFinding.severity || 'UNKNOWN'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="glass" style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.2)' }}>
                <span className="data-mono" style={{ fontSize: '0.6rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>SOURCE_ORIGIN</span>
                <div style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>{selectedFinding.source}</div>
                <div className="data-mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedFinding.sourceUrl}</div>
              </div>
              <div className="glass" style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.2)' }}>
                <span className="data-mono" style={{ fontSize: '0.6rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>IDENTIFIED_TARGET</span>
                <div style={{ fontSize: '0.9rem', color: 'white', fontWeight: 600 }}>{selectedFinding.matchedValue || selectedFinding.matched_value || 'N/A'}</div>
                <div className="data-mono" style={{ fontSize: '0.65rem', color: 'var(--accent-orange)', marginTop: '0.5rem' }}>MATCH_VECTOR_POSITIVE</div>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <span className="data-mono" style={{ fontSize: '0.6rem', color: 'var(--text-dim)', display: 'block', marginBottom: '1rem' }}>RECON_DATA_PAYLOAD</span>
              <div className="data-mono" style={{ 
                padding: '1.5rem', 
                background: '#050505', 
                border: '1px solid var(--border-light)', 
                borderRadius: '4px',
                fontSize: '0.8rem',
                lineHeight: 1.6,
                color: '#00ff88',
                maxHeight: '350px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap'
              }}>
                {selectedFinding.rawData || 'NO_PAYLOAD_DATA_AVAILABLE'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setSelectedFinding(null)}
                style={{ flex: 1, padding: '1rem', background: 'transparent', border: '1px solid var(--border-light)', color: 'white', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.7rem', borderRadius: '4px' }}
              >
                CLOSE_DOSSIER
              </button>
              <button 
                style={{ flex: 1, padding: '1rem', background: 'var(--accent-cyan)', border: 'none', color: 'black', fontWeight: 900, cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.7rem', borderRadius: '4px' }}
                onClick={() => window.print()}
              >
                DOWNLOAD_EVIDENCE_LOG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SURGICAL VAULT PURGE MODAL - FINDINGS VERSION */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay animate-in" style={{
          position: 'fixed',
          inset: 0,
          background: 'transparent',
          zIndex: 1000000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div className="surgical-vault-panel" style={{
            width: '100%',
            maxWidth: '450px',
            background: '#0a0a0a',
            border: '1px solid rgba(255, 0, 60, 0.3)',
            boxShadow: '0 0 100px rgba(255, 0, 60, 0.15)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'var(--accent-red)', boxShadow: '0 0 15px var(--accent-red)', animation: 'scan 3s linear infinite' }}></div>
            
            <div style={{ padding: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 0, 60, 0.1)', paddingBottom: '1rem' }}>
                <ShieldAlert size={24} style={{ color: 'var(--accent-red)' }} />
                <h2 className="data-mono" style={{ fontSize: '0.9rem', color: 'white', letterSpacing: '3px', margin: 0 }}>DATABASE_PURGE_v2.4</h2>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }}>
                <p className="data-mono" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.8', margin: 0 }}>
                  WARNING: YOU ARE ABOUT TO PERFORM A COMPLETE PROTOCOL WIPE OF THE INTELLIGENCE DATABASE.
                  <br/><br/>
                  <span style={{ color: 'var(--accent-red)' }}>&gt; TARGET: INTEL_HISTORY_LOGS</span><br/>
                  <span style={{ color: 'var(--accent-red)' }}>&gt; EFFECT: IRREVERSIBLE_DATA_ERASURE</span>
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{ 
                    padding: '1rem', 
                    background: 'transparent', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    color: 'white', 
                    cursor: 'pointer', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                  className="data-mono"
                >
                  [ ABORT ]
                </button>
                <button 
                  onClick={handleClearAll}
                  style={{ 
                    padding: '1rem', 
                    background: 'var(--accent-red)', 
                    border: 'none', 
                    color: 'white', 
                    fontWeight: 900, 
                    cursor: 'pointer', 
                    fontSize: '0.75rem',
                    boxShadow: '0 0 20px rgba(255, 0, 60, 0.4)',
                    transition: 'all 0.2s'
                  }}
                  className="data-mono"
                >
                  [ EXECUTE_WIPE ]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Findings;
