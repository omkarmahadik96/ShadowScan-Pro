import React, { useState, useCallback, useMemo } from 'react';
import {
  Activity,
  Plus,
  Trash2,
  Search,
  Mail,
  Globe,
  Hash,
  Database,
  ShieldCheck,
  Power,
  Play,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  WifiOff
} from 'lucide-react';
import { useFindingsStore } from '../store/findingsStore';
import './Watchlist.css';

const Watchlist = () => {
  const { updateStats, watchlist, setWatchlist, stats, isConnected } = useFindingsStore();
  const [isLoading, setIsLoading] = useState(!watchlist.length);
  const isScanning = stats?.scheduler?.isRunning || false;
  const autoScan = stats?.scheduler?.autoScanEnabled || false;
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const API_BASE = useMemo(() => import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || ''), []);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/watchlist`);
      const json = await res.json();
      if (json.success) setWatchlist(json.data);
    } catch (err) {
      showNotification('Failed to sync watchlist data.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE, setWatchlist]);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/system/scan-status`);
      const json = await res.json();
      if (json.success) {
        updateStats({ scheduler: json.data });
      }
    } catch (err) {}
  }, [API_BASE, updateStats]);

  React.useEffect(() => {
    if (!watchlist.length) fetchItems();
    fetchStatus();
    
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchItems, fetchStatus, watchlist.length]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ type: 'email', value: '', label: '', priority: 'MEDIUM' });

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.value) return;

    setActionLoading('add');
    try {
      const res = await fetch(`${API_BASE}/api/v1/watchlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      const json = await res.json();
      if (json.success) {
        setWatchlist([json.data, ...watchlist]);
        setShowAddModal(false);
        setNewItem({ type: 'email', value: '', label: '', priority: 'MEDIUM' });
        showNotification('Target successfully initialized.', 'success');
        
        const statsRes = await fetch(`${API_BASE}/api/v1/system/stats`);
        const statsJson = await statsRes.json();
        if (statsJson.success) updateStats(statsJson.data);
      }
    } catch (err) {
      showNotification('Initialization protocol failed.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(`delete-${id}`);
    try {
      const res = await fetch(`${API_BASE}/api/v1/watchlist/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setWatchlist(watchlist.filter((item: any) => item.id !== id));
        showNotification('Target decommissioned.', 'info');
      }
    } catch (err) {
      showNotification('Decommissioning failed.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (id: string) => {
    setActionLoading(`toggle-${id}`);
    try {
      const res = await fetch(`${API_BASE}/api/v1/watchlist/${id}/toggle`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setWatchlist(watchlist.map((item: any) => item.id === id ? json.data : item));
        showNotification(`Surveillance ${json.data.isActive ? 'resumed' : 'paused'}.`, 'info');
      }
    } catch (err) {
      showNotification('Status toggle failed.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleTriggerScan = async () => {
    if (isScanning) return;
    

    updateStats({ scheduler: { ...stats?.scheduler, isRunning: true } });

    try {
      const res = await fetch(`${API_BASE}/api/v1/system/trigger-scan`, { method: 'POST' });
      const json = await res.json();
      if (!json.success) {
        showNotification('Failed to trigger scan.', 'error');
        fetchStatus();
      }
    } catch (err) {
      showNotification('Network error during scan trigger.', 'error');
      fetchStatus();
    }
  };

  const handleToggleAutoScan = async () => {
    const nextState = !autoScan;
    updateStats({ scheduler: { ...stats?.scheduler, autoScanEnabled: nextState } });
    
    try {
      const res = await fetch(`${API_BASE}/api/v1/system/auto-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextState })
      });
      const json = await res.json();
      if (json.success) {
        showNotification(`Auto-Surveillance ${nextState ? 'ENABLED' : 'DISABLED'}`, 'info');
      } else {
        updateStats({ scheduler: { ...stats?.scheduler, autoScanEnabled: !nextState } });
        showNotification('Failed to update config.', 'error');
      }
    } catch (err) {
      updateStats({ scheduler: { ...stats?.scheduler, autoScanEnabled: !nextState } });
      showNotification('Network error.', 'error');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail size={18} />;
      case 'domain': return <Globe size={18} />;
      case 'keyword': return <Hash size={18} />;
      case 'ip': return <Database size={18} />;
      default: return <ShieldCheck size={18} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'var(--accent-red)';
      case 'HIGH': return 'var(--accent-orange)';
      case 'MEDIUM': return 'var(--accent-cyan)';
      default: return 'var(--text-dim)';
    }
  };

  return (
    <div className="watchlist-container animate-in">
      {notification && (
        <div className={`toast-notification ${notification.type} animate-slide-in`}>
          {notification.type === 'success' && <CheckCircle2 size={16} />}
          {notification.type === 'error' && <AlertTriangle size={16} />}
          <span className="data-mono">{notification.message}</span>
        </div>
      )}

      <div className="page-header-premium glass">
        {!isConnected && (
          <div className="offline-warning-overlay">
            <WifiOff size={16} />
            <span>CRITICAL: UPLINK_LOST - COMMAND_SYNC_DISABLED</span>
          </div>
        )}
          <div className="tactical-status-banner">
            <div className={`status-node-glow ${autoScan ? 'active' : 'idle'}`} />
            <span className="data-mono label">ENGINE_STATE:</span>
            <span className={`data-mono value ${autoScan ? 'active' : 'idle'}`}>
              {autoScan ? 'AUTO_SURVEILLANCE_ACTIVE' : 'AUTO_SURVEILLANCE_DISABLED'}
            </span>
            <div className="scan-line-minimal" />
          </div>

          <div className="header-left">
            <div className="title-box">
              <Activity className="glow-cyan icon-large" />
              <div>
                <h1 className="title-main">SURVEILLANCE_COMMAND</h1>
                <div className="subtitle-box">
                  <span className="dot-active" />
                  <p className="subtitle-text">ACTIVE_THREAT_LATTICE_MONITOR</p>
                </div>
              </div>
            </div>
            <div className="stats-row-mini">
               <div className="stat-pill">
                 <span className="label">TARGETS:</span>
                 <span className="value">{watchlist.length}</span>
               </div>
               <div className="stat-pill">
                 <span className="label">UPLINK:</span>
                 <span className="value green">STABLE</span>
               </div>
            </div>
          </div>
        
        <div className="header-right">
          <div className="control-group">
            <div className="auto-scan-panel" onClick={handleToggleAutoScan}>
              <span className="data-mono label-tiny">AUTO_PILOT</span>
              <div className={`toggle-pill ${autoScan ? 'active' : ''}`}>
                <div className="thumb" />
              </div>
            </div>

            <button 
              className={`btn-cyber ${isScanning ? 'scanning' : ''}`}
              onClick={handleTriggerScan}
              disabled={isScanning}
            >
              {isScanning ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
              <span>{isScanning ? 'SCANNING_...' : 'INIT_SCAN'}</span>
            </button>

            <button className="btn-glow-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={18} /> INITIALIZE_NODE
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-state-full">
          <div className="scanner-line" />
          <Loader2 size={48} className="animate-spin glow-cyan" />
          <p className="data-mono">DECRYPTING_TARGET_VAULT...</p>
        </div>
      ) : watchlist.length === 0 ? (
        <div className="empty-state-premium glass">
          <div className="empty-icon-box">
            <Database size={64} className="text-dim" />
            <div className="crosshair" />
          </div>
          <h3 className="data-mono">ZERO_TARGETS_IN_QUEUE</h3>
          <p>The surveillance engine is idling. Deploy new probes to begin intel acquisition.</p>
          <button className="btn-glow-primary" onClick={() => setShowAddModal(true)}>
            DEPLOY_FIRST_PROBE
          </button>
        </div>
      ) : (
        <div className="watchlist-grid-premium">
          {watchlist.map((item: any) => (
            <div key={item.id} className={`node-card glass ${item.isActive ? 'active' : 'standby'}`}>
              <div className="card-edge" style={{ background: getPriorityColor(item.priority) }} />
              
              <div className="card-header-mini">
                <div className="type-box">
                  {getIcon(item.type)}
                  <span className="data-mono label-tiny">{item.type?.toUpperCase()}</span>
                </div>
                <div className="priority-tag" style={{ color: getPriorityColor(item.priority), borderColor: getPriorityColor(item.priority) }}>
                  {item.priority}
                </div>
              </div>

              <div className="node-content">
                <h3 className="node-label">{item.label || 'UNTITLED_NODE'}</h3>
                <div className="node-value-box">
                  <span className="value-text">{item.value}</span>
                  <div className="scan-line-mini" />
                </div>
              </div>

              <div className="card-actions-premium">
                <div className="status-pill">
                  <div className={`status-dot ${item.isActive ? 'live' : ''}`} />
                  <span className="data-mono status-txt">{item.isActive ? 'LIVE_UPLINK' : 'OFFLINE'}</span>
                </div>

                <div className="btn-set">
                  <button
                    className={`btn-action-mini ${item.isActive ? 'pause' : 'resume'}`}
                    onClick={() => handleToggleStatus(item.id)}
                    disabled={actionLoading === `toggle-${item.id}`}
                  >
                    {actionLoading === `toggle-${item.id}` ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      item.isActive ? <Power size={12} /> : <Play size={12} />
                    )}
                    {item.isActive ? 'PAUSE' : 'RESUME'}
                  </button>
                  <button
                    className="btn-action-mini delete"
                    onClick={() => handleDelete(item.id)}
                    disabled={actionLoading === `delete-${item.id}`}
                  >
                    {actionLoading === `delete-${item.id}` ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Trash2 size={12} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay-premium" onClick={() => setShowAddModal(false)}>
          <div className="modal-box glass animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <h2 className="data-mono title-modal">NODE_INITIALIZATION_PROTOCOL</h2>
              <p className="modal-desc">Configure the surveillance hook parameters.</p>
            </div>
            
            <form onSubmit={handleAddItem} className="modal-body">
              <div className="form-row">
                <div className="form-field">
                  <label className="data-mono label-field">ENTITY_TYPE</label>
                  <select
                    value={newItem.type}
                    onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                  >
                    <option value="email">EMAIL_ADDRESS</option>
                    <option value="domain">DOMAIN_NAME</option>
                    <option value="keyword">KEYWORD_ALIAS</option>
                    <option value="ip">IP_ADDRESS</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="data-mono label-field">TARGET_DESIGNATION</label>
                  <input
                    type="text"
                    placeholder="e.g. VIP_EXECUTIVE"
                    value={newItem.label}
                    onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="data-mono label-field">IDENTIFIER_VALUE</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 192.168.1.1 / user@domain.com"
                  value={newItem.value}
                  onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label className="data-mono label-field">PRIORITY_LATTICE</label>
                <div className="priority-grid">
                  {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewItem({ ...newItem, priority: p })}
                      className={`priority-item ${newItem.priority === p ? 'active' : ''}`}
                      style={{ '--p-color': getPriorityColor(p) } as any}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-bottom">
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>ABORT_MISSION</button>
                <button type="submit" className="btn-submit" disabled={actionLoading === 'add'}>
                  {actionLoading === 'add' ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                  AUTHORIZE_DEPLOYMENT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Watchlist;
