import React, { useState, useEffect } from 'react';
import {
  Bell,
  ShieldAlert,
  Activity,
  Zap,
  CheckCircle,
  Clock,
  Radio
} from 'lucide-react';
import './Alerts.css';

import { useFindingsStore } from '../store/findingsStore';

const Alerts = () => {
  const { alerts, setAlerts, acknowledgeAlert } = useFindingsStore();
  const [routingNodes, setRoutingNodes] = useState<any[]>([]);
  const [latency, setLatency] = useState<number>(42);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');
    // 1. Fetch initial alerts from backend
    fetch(`${API_BASE}/api/v1/alerts`)
      .then(res => res.json())
      .then(json => {
        if (json.success) setAlerts(json.data);
      });

    // 2. Fetch static routing configuration
    fetch(`${API_BASE}/api/v1/routing`)
      .then(res => res.json())
      .then(json => {
        if (json.success) setRoutingNodes(json.data);
      });

    // 3. Listen for latency updates
    const socket = (window as any).io_client;
    if (socket) {
      socket.on('system_health_update', (data: any) => {
        if (data.latency) setLatency(data.latency);
      });
    }
  }, []);

  const handleClearAll = async () => {
    try {
      const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');
      const res = await fetch(`${API_BASE}/api/v1/alerts/clear`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setAlerts([]);
        setShowDeleteConfirm(false);
      }
    } catch (err) { console.error('Failed to clear alerts:', err); }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');
      const res = await fetch(`${API_BASE}/api/v1/alerts/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        acknowledgeAlert(id);
      }
    } catch (err) { console.error('Failed to acknowledge alert:', err); }
  };

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '4rem' }}>
      <div className="page-title-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Security Alerts</h1>
          <p className="page-subtitle">Real-time notifications triggered by autonomous monitoring rules and risk thresholds.</p>
        </div>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          style={{
            background: 'transparent',
            border: '1px solid var(--accent-red)',
            color: 'var(--accent-red)',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'Orbitron'
          }}
          className="glow-red-hover"
        >
          <Bell size={16} /> CLEAR_ALL_INCIDENTS
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>

        {/* Main Alert Feed - Full Width on Mobile, 75% on Desktop */}
        <div style={{ flex: '4 1 700px', display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: 'calc(100vh - 200px)' }}>
          <div className="glass" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Activity style={{ color: 'var(--accent-cyan)' }} />
                <h3 className="data-mono" style={{ fontSize: '1.1rem', margin: 0 }}>ACTIVE_INCIDENTS</h3>
              </div>
              <div className="status-badge" style={{ background: 'rgba(255, 68, 68, 0.1)', color: 'var(--accent-red)', border: '1px solid var(--accent-red)' }}>
                {alerts.length} PENDING
              </div>
            </div>

            <div className="tactical-scrollbar" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1.25rem', 
              overflowY: 'auto', 
              maxHeight: 'calc(100vh - 280px)',
              paddingRight: '0.75rem',
              marginTop: '0.5rem'
            }}>
              {alerts.length > 0 ? alerts.map((alert: any) => (
                <div key={alert.id} className="glass" style={{
                  padding: '1.5rem 2rem',
                  borderLeft: `4px solid var(--accent-${alert.severity === 'CRITICAL' ? 'red' : 'orange'})`,
                  background: 'rgba(255,255,255,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  flexShrink: 0,
                  width: '100%',
                  borderRadius: '0 8px 8px 0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <ShieldAlert size={18} style={{ color: alert.severity === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-orange)' }} />
                      <span className="data-mono" style={{ fontSize: '0.85rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                        [{alert.source.toUpperCase()}]
                      </span>
                    </div>
                    <span className="data-mono" style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={12} /> {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()}
                    </span>
                  </div>

                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontFamily: 'Orbitron', color: 'white' }}>{alert.title || 'Threat Detected'}</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      Critical exposure identified matching surveillance node: <strong style={{ color: 'var(--accent-cyan)' }}>{alert.matched_value}</strong>
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="data-mono" style={{ fontSize: '0.75rem', color: alert.severity === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-orange)' }}>
                      SEVERITY: {alert.severity}
                    </span>
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--accent-cyan)',
                        color: 'var(--accent-cyan)',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontFamily: 'Orbitron',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                      className="glow-cyan-hover"
                    >
                      <CheckCircle size={14} /> ACKNOWLEDGE
                    </button>
                  </div>
                </div>
              )) : (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', border: '1px dashed var(--border-light)', borderRadius: '8px', background: 'rgba(255,255,255,0.01)' }}>
                  <Bell size={48} style={{ color: 'var(--text-dim)', marginBottom: '1.5rem', opacity: 0.3 }} />
                  <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>No Active Alerts</h3>
                  <p className="data-mono" style={{ fontSize: '0.85rem', color: 'var(--text-dim)', maxWidth: '300px' }}>
                    All threat nodes are secure. No critical data exposures detected in the current monitoring cycle.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Side Panel - Routing & Status */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '0', height: 'fit-content' }}>
          <div className="glass" style={{ padding: '1.5rem' }}>
            <h3 className="data-mono" style={{ fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
              <Radio size={16} style={{ color: 'var(--accent-cyan)' }} /> ALERT_ROUTING
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {routingNodes.map(ch => (
                <div key={ch.name} className="glass" style={{ 
                  padding: '0.75rem 1rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.25rem', 
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.03)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="data-mono" style={{ fontSize: '0.7rem', color: 'white' }}>{ch.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                       {ch.status === 'ACTIVE' && <div className="status-dot animate-pulse" style={{ width: '4px', height: '4px', background: 'var(--accent-green)' }}></div>}
                       <span style={{ fontSize: '0.55rem', fontWeight: 800, color: ch.color }}>
                        {ch.status}
                       </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{ch.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass" style={{ padding: '1.5rem', background: 'rgba(0, 242, 255, 0.05)', border: '1px solid rgba(0, 242, 255, 0.1)' }}>
            <h4 className="data-mono" style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>SYSTEM_HEALTH</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Alert dispatch latency is currently <strong>{latency}ms</strong>. All active routing gateways are synchronized and responding normally.
            </p>
          </div>
        </div>

      </div>

      {/* SURGICAL VAULT PURGE MODAL - ALERTS VERSION */}
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
                <Bell size={24} style={{ color: 'var(--accent-red)' }} />
                <h2 className="data-mono" style={{ fontSize: '0.9rem', color: 'white', letterSpacing: '3px', margin: 0 }}>INCIDENT_PURGE_v1.0</h2>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }}>
                <p className="data-mono" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.8', margin: 0 }}>
                  WARNING: YOU ARE ABOUT TO PURGE ALL ACTIVE INCIDENTS FROM THE REAL-TIME ALERT MONITOR.
                  <br/><br/>
                  <span style={{ color: 'var(--accent-red)' }}>&gt; TARGET: ACTIVE_THREAT_QUEUE</span><br/>
                  <span style={{ color: 'var(--accent-red)' }}>&gt; STATUS: PERMANENT_ACKNOWLEDGE_ALL</span>
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
                  [ EXECUTE_PURGE ]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alerts;
