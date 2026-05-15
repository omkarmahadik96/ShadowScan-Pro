import React from 'react';
import {
  Key,
  Shield,
  Bell,
  Users,
  Database,
  Cpu,
  Save,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Trash2,
  Download,
  Upload,
  Globe,
  CheckCircle2
} from 'lucide-react';
import { useFindingsStore } from '../store/findingsStore';
import './Settings.css';

const Settings = () => {
  const { clearFindings, resetSystem, findings, setFindings } = useFindingsStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = React.useState('api');
  const [isSaving, setIsSaving] = React.useState(false);
  const [showKeys, setShowKeys] = React.useState<Record<string, boolean>>({});
  const [confirmAction, setConfirmAction] = React.useState<string | null>(null);

  const stats = React.useMemo(() => {
    if (activeTab !== 'storage') return { size: '0 KB', integrity: '100%', lastBackup: 'SYNCED' };
    const bytes = findings.length * 824 + 1024; 
    const size = bytes > 1024 * 1024 
      ? `${(bytes / (1024 * 1024)).toFixed(2)} MB` 
      : `${(bytes / 1024).toFixed(1)} KB`;
    const validEntries = findings.filter(f => f.id && f.discovered_at).length;
    const integrity = findings.length > 0 
      ? ((validEntries / findings.length) * 100).toFixed(1) + '%'
      : '100%';
    return { size, integrity, lastBackup: 'SYNCED' };
  }, [findings, activeTab]);

  const [gatewayStatus, setGatewayStatus] = React.useState([
    { id: 'breach_db', name: 'BreachDB_Index', type: 'INTERNAL', status: 'ACTIVE', latency: '4ms' },
    { id: 'ahmia', name: 'Tor_Global_Index', type: 'ONION_MESH', status: 'ACTIVE', latency: '820ms' },
    { id: 'nmap', name: 'Network_Scanner', type: 'INFRASTRUCTURE', status: 'ACTIVE', latency: '12ms' },
    { id: 'github', name: 'GitHub_Scraper', type: 'OSINT', status: 'ACTIVE', latency: '156ms' },
    { id: 'telegram', name: 'Telegram_Monitor', type: 'SOCIAL_INTEL', status: 'ACTIVE', latency: '42ms' }
  ]);

  const [engineSettings, setEngineSettings] = React.useState({
    interval: 15,
    workers: 24,
    torPort: 9050,
    torHost: '127.0.0.1',
    stealthMode: true,
    userAgentSpoof: true,
    autoScan: true
  });

  const [notificationSettings, setNotificationSettings] = React.useState({
    email: { enabled: true, address: 'admin@shadowscan.pro' },
    discord: { enabled: false, webhook: '' },
    telegram: { enabled: true, chatId: '', botToken: '' }
  });

  const [securityProtocol, setSecurityProtocol] = React.useState({
    twoFactor: true,
    sessionLock: 120,
    ipWhitelist: false,
    auditLogging: true
  });

  const [teamMembers, setTeamMembers] = React.useState([
    { id: 1, name: 'ADMIN_ROOT', role: 'SuperUser', status: 'Online' },
    { id: 2, name: 'ANALYST_01', role: 'Forensics', status: 'Online' },
    { id: 3, name: 'SURVEILLANCE_BOT', role: 'Automated', status: 'Online' }
  ]);

  const [isAddingOperator, setIsAddingOperator] = React.useState(false);
  const [newOpName, setNewOpName] = React.useState('');
  const [isTestingProxy, setIsTestingProxy] = React.useState(false);
  const [proxyStatus, setProxyStatus] = React.useState<'idle' | 'success'>('idle');

  const testProxyConnection = async () => {
    setIsTestingProxy(true);
    setProxyStatus('idle');
    try {
      const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');
      const res = await fetch(`${API_BASE}/api/v1/system/test-proxy`);
      const json = await res.json();
      if (json.success) {
        setProxyStatus('success');
      } else {
        alert(`TUNNEL_FAILURE: ${json.error || 'Check if Tor is running on port ' + engineSettings.torPort}`);
        setProxyStatus('idle');
      }
    } catch (err) {
      alert('COMM_FAILURE: Unable to reach proxy validation service.');
    } finally {
      setIsTestingProxy(false);
    }
  };

  const handleExportVault = () => {
    const dataStr = JSON.stringify(findings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `shadowscan_vault_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  React.useEffect(() => {
    const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');
    // 1. Fetch current system config from backend
    fetch(`${API_BASE}/api/v1/system/config`)
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setEngineSettings(json.data.engine);
          setNotificationSettings(json.data.notifications);
          setSecurityProtocol(json.data.security);
        }
      })
      .catch(err => console.warn('Failed to fetch system config:', err));

    // 2. Fetch operators
    fetch(`${API_BASE}/api/v1/operators`)
      .then(res => res.json())
      .then(json => {
        if (json.success) setTeamMembers(json.data);
      })
      .catch(err => console.warn('Failed to fetch operators:', err));
  }, []);

  const handleRestoreSnapshot = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
          // POST TO BACKEND FOR PERSISTENCE
          const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');
          const res = await fetch(`${API_BASE}/api/v1/findings/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(json)
          });
          const result = await res.json();
          if (result.success) {
            setFindings(result.data);
            alert('VAULT_RESTORED: Snapshot synchronized with backend.');
          }
        }
      } catch (err) { alert('RESTORE_ERROR: Invalid format or connection failure.'); }
    };
    reader.readAsText(file);
  };

  const [showSuccess, setShowSuccess] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setShowSuccess(false);
    
    try {
      const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');
      const res = await fetch(`${API_BASE}/api/v1/system/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engine: engineSettings,
          notifications: notificationSettings,
          security: securityProtocol
        })
      });
      
      const json = await res.json();
      if (json.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        alert('SYNC_ERROR: Backend rejected configuration packet.');
      }
    } catch (err: any) {
      console.error('Failed to save config:', err);
      alert('COMM_FAILURE: ' + (err.message || 'Unable to reach command server.'));
    } finally {
      setIsSaving(false);
    }
  };

  const NavItem = React.useMemo(() => {
    return ({ id, label, icon: Icon }: any) => (
      <button className={`settings-nav-item ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', pointerEvents: 'none' }}>
          <Icon size={16} />
          <span>{label}</span>
        </div>
      </button>
    );
  }, [activeTab]);

  const Toggle = ({ active, onToggle }: { active: boolean, onToggle: () => void }) => (
    <div className={`toggle-switch ${active ? 'active' : ''}`} onClick={onToggle}>
      <div className="toggle-knob" />
    </div>
  );

  return (
    <div className="settings-container fade-in">
      {confirmAction && (
        <div className="modal-overlay">
          <div className="glass modal-content animate-slide-up" style={{ width: '400px', textAlign: 'center' }}>
            <Lock size={40} style={{ color: '#ef4444', marginBottom: '1rem', margin: '0 auto' }} />
            <h3 className="data-mono" style={{ color: '#ef4444' }}>CONFIRM_DESTRUCTION</h3>
            <p style={{ fontSize: '0.8rem', opacity: 0.7, margin: '1rem 0' }}>Irreversible system wipe initiated. All forensic logs will be purged.</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn-outline" style={{ flex: 1 }} onClick={() => setConfirmAction(null)}>ABORT</button>
              <button className="btn-primary" style={{ flex: 1, background: '#ef4444' }} onClick={() => {
                if (confirmAction === 'purge') clearFindings(); else resetSystem();
                setConfirmAction(null);
              }}>AUTHORIZE</button>
            </div>
          </div>
        </div>
      )}

      {isAddingOperator && (
        <div className="modal-overlay">
          <div className="glass modal-content animate-slide-up" style={{ width: '380px' }}>
            <h3 className="data-mono">NEW_OPERATOR</h3>
            <div className="settings-input-group" style={{ marginTop: '1.5rem' }}>
              <label>IDENTITY_CODE</label>
              <input className="settings-input" placeholder="ANALYST_XX" value={newOpName} onChange={(e) => setNewOpName(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn-outline" style={{ flex: 1 }} onClick={() => setIsAddingOperator(false)}>CANCEL</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={async () => {
                if (newOpName) {
                  try {
                    const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');
                    const res = await fetch(`${API_BASE}/api/v1/operators`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: newOpName, role: 'Analyst' })
                    });
                    const json = await res.json();
                    if (json.success) setTeamMembers([...teamMembers, json.data]);
                  } catch (err) { console.error('Failed to add operator:', err); }
                }
                setIsAddingOperator(false);
                setNewOpName('');
              }}>GRANT_ACCESS</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ minWidth: '300px' }}>
          <h1 className="data-mono" style={{ fontSize: '1.5rem', letterSpacing: '4px', margin: 0 }}>PLATFORM_CONFIGURATION</h1>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.5, fontSize: '0.75rem' }}>Central command for forensic requisition and network hardening.</p>
        </div>
        <button
          className={`btn-primary ${showSuccess ? 'success' : ''}`}
          onClick={handleSave}
          disabled={isSaving}
          style={{ width: '100%', maxWidth: '300px', justifyContent: 'center' }}
        >
          {isSaving ? <RefreshCw size={16} className="animate-spin" /> : showSuccess ? <CheckCircle2 size={16} /> : <Save size={16} />}
          <span>{isSaving ? 'SYNCING...' : showSuccess ? 'PROTOCOL_SYNCED' : 'COMMIT_CHANGES'}</span>
        </button>
      </div>

      <div className="settings-grid">
        <div className="settings-nav">
          <NavItem id="api" label="INTEL_GATEWAYS" icon={Key} />
          <NavItem id="engine" label="SCAN_CORE" icon={Cpu} />
          <NavItem id="notifications" label="ALERT_BUS" icon={Bell} />
          <NavItem id="security" label="SAFEGUARDS" icon={Shield} />
          <NavItem id="team" label="OPERATORS" icon={Users} />
          <NavItem id="storage" label="VAULT_CTRL" icon={Database} />
        </div>

        <div className="settings-content-wrapper">
          {activeTab === 'api' && (
            <div className="settings-section">
              <h3><Key size={18} /> INTELLIGENCE_GATEWAYS <span className="section-tag">CORE_INTEGRATION</span></h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '1.5rem', marginTop: '-1rem' }}>
                Real-time status of the integrated forensic sources powering the surveillance engine.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {gatewayStatus.map((gate) => (
                  <div key={gate.id} className="api-item" style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ fontSize: '0.85rem', color: 'white', fontWeight: 700, fontFamily: 'Orbitron' }}>{gate.name}</div>
                        <span className="data-mono" style={{ fontSize: '0.6rem', color: 'var(--accent-cyan)', background: 'rgba(0, 242, 255, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>{gate.type}</span>
                      </div>
                      <div className="data-mono" style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                        LATENCY: <span style={{ color: 'var(--accent-cyan)' }}>{gate.latency}</span> // UPLINK: STABLE
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.65rem', color: '#00ff88', fontWeight: 800 }}>{gate.status}</div>
                        <div style={{ fontSize: '0.55rem', opacity: 0.5 }}>SYNCHRONIZED</div>
                      </div>
                      <span style={{ width: '8px', height: '8px', background: '#00ff88', borderRadius: '50%', boxShadow: '0 0 10px #00ff88', animation: 'pulse 2s infinite', flexShrink: 0, display: 'inline-block' }}></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'engine' && (
            <div className="settings-section">
              <h3><Cpu size={18} /> SCAN_ENGINE_CONFIG <span className="section-tag">OPERATIONAL</span></h3>
              <div className="form-grid">
                <div className="settings-input-group">
                  <label><span>CRAWL_INTERVAL</span><span>{engineSettings.interval}m</span></label>
                  <input type="range" min="1" max="60" value={engineSettings.interval} onChange={(e) => setEngineSettings({ ...engineSettings, interval: parseInt(e.target.value) })} />
                </div>
                <div className="settings-input-group">
                  <label><span>THREAD_COUNT</span><span>{engineSettings.workers} CORES</span></label>
                  <input type="range" min="4" max="64" value={engineSettings.workers} onChange={(e) => setEngineSettings({ ...engineSettings, workers: parseInt(e.target.value) })} />
                </div>
                <div className="settings-input-group" style={{ gridColumn: 'span 2' }}>
                  <label>SOCKS5_PROXY_TUNNEL</label>
                  <div className="proxy-input-group" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <input className="settings-input" style={{ flex: '2 1 200px' }} value={engineSettings.torHost} onChange={(e) => setEngineSettings({ ...engineSettings, torHost: e.target.value })} />
                    <input type="number" className="settings-input" style={{ flex: '1 1 80px' }} value={engineSettings.torPort} onChange={(e) => setEngineSettings({ ...engineSettings, torPort: parseInt(e.target.value) })} />
                    <button className={`btn-outline ${proxyStatus === 'success' ? 'success-glow' : ''}`} style={{ flex: '0 0 auto' }} onClick={testProxyConnection} disabled={isTestingProxy}>
                      {isTestingProxy ? <RefreshCw size={14} className="animate-spin" /> : <Globe size={14} />}
                    </button>
                  </div>
                </div>
                <div className="api-item" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                  <div style={{ flex: 1 }}><div style={{ fontSize: '0.7rem' }}>STEALTH_PROTOCOL</div><div style={{ fontSize: '0.6rem', opacity: 0.5 }}>Randomize packet intervals</div></div>
                  <Toggle active={engineSettings.stealthMode} onToggle={() => setEngineSettings({ ...engineSettings, stealthMode: !engineSettings.stealthMode })} />
                </div>
                <div className="api-item" style={{ gridColumn: 'span 2', marginBottom: 0, border: '1px solid rgba(0, 242, 255, 0.15)', background: 'rgba(0, 242, 255, 0.02)' }}>
                  <div style={{ flex: 1 }}><div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 800 }}>HYBRID_INTELLIGENCE_MODE</div><div style={{ fontSize: '0.6rem', opacity: 0.5 }}>Autonomous background surveillance</div></div>
                  <Toggle active={engineSettings.autoScan} onToggle={() => setEngineSettings({ ...engineSettings, autoScan: !engineSettings.autoScan })} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h3><Bell size={18} /> ALERT_BROADCAST <span className="section-tag">UPLINK</span></h3>
              <div className="form-grid">
                {[
                  { id: 'email', label: 'SMTP_ENDPOINT', val: notificationSettings.email.address },
                  { id: 'discord', label: 'DISCORD_WEBHOOK', val: notificationSettings.discord.webhook },
                  { id: 'telegram', label: 'TELEGRAM_CHAT_ID', val: notificationSettings.telegram.chatId }
                ].map(chan => (
                  <div key={chan.id} className="api-item" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.7rem' }}>{chan.label}</div>
                      <input 
                        className="settings-input" 
                        style={{ marginTop: '0.5rem', width: '90%' }} 
                        value={chan.val} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setNotificationSettings(prev => ({
                            ...prev,
                            [chan.id]: { ...(prev as any)[chan.id], [chan.id === 'email' ? 'address' : chan.id === 'discord' ? 'webhook' : 'chatId']: val }
                          }));
                        }} 
                      />
                      {chan.id === 'telegram' && (
                        <div style={{ marginTop: '1rem' }}>
                          <div style={{ fontSize: '0.7rem' }}>TELEGRAM_BOT_TOKEN</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input 
                              type={showKeys['tg_token'] ? 'text' : 'password'}
                              className="settings-input" 
                              style={{ marginTop: '0.5rem', width: '90%', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }} 
                              placeholder="7123456789:AAH_XXXXXXXXXXXXX"
                              value={notificationSettings.telegram.botToken || ''} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setNotificationSettings(prev => ({
                                  ...prev,
                                  telegram: { ...prev.telegram, botToken: val }
                                }));
                              }} 
                            />
                            <button 
                              onClick={() => setShowKeys(prev => ({ ...prev, tg_token: !prev.tg_token }))}
                              style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', marginTop: '0.5rem' }}
                            >
                              {showKeys['tg_token'] ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <Toggle 
                      active={(notificationSettings as any)[chan.id].enabled} 
                      onToggle={() => {
                        setNotificationSettings(prev => ({
                          ...prev,
                          [chan.id]: { ...(prev as any)[chan.id], enabled: !(prev as any)[chan.id].enabled }
                        }));
                      }} 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h3><Shield size={18} /> SAFEGUARD_PROTOCOL <span className="section-tag">HARDENING</span></h3>
              <div className="form-grid">
                <div className="api-item" style={{ gridColumn: 'span 2' }}>
                  <div style={{ flex: 1 }}><div style={{ fontSize: '0.7rem' }}>MULTI_FACTOR_AUTH</div><div style={{ fontSize: '0.6rem', opacity: 0.5 }}>Require biometric confirmation</div></div>
                  <Toggle active={securityProtocol.twoFactor} onToggle={() => setSecurityProtocol({ ...securityProtocol, twoFactor: !securityProtocol.twoFactor })} />
                </div>
                <div className="settings-input-group" style={{ gridColumn: 'span 2' }}>
                  <label><span>SESSION_TIMEOUT</span><span>{securityProtocol.sessionLock}m</span></label>
                  <input type="range" min="15" max="480" step="15" value={securityProtocol.sessionLock} onChange={(e) => setSecurityProtocol({ ...securityProtocol, sessionLock: parseInt(e.target.value) })} />
                </div>
                <div className="api-item" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                  <div style={{ flex: 1 }}><div style={{ fontSize: '0.7rem' }}>AUDIT_LOGGING</div><div style={{ fontSize: '0.6rem', opacity: 0.5 }}>Track all operator sessions</div></div>
                  <Toggle active={securityProtocol.auditLogging} onToggle={() => setSecurityProtocol({ ...securityProtocol, auditLogging: !securityProtocol.auditLogging })} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="settings-section">
              <h3><Users size={18} /> OPERATOR_REGISTRY <span className="section-tag">ADMIN</span></h3>
              <div className="team-list">
                {teamMembers.map(member => (
                  <div key={member.id} className="user-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: 'var(--accent-cyan-dim)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900, flexShrink: 0 }}>{member.name.substring(0, 2)}</div>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{member.name}</div>
                        <div style={{ fontSize: '0.55rem', color: 'var(--accent-cyan)' }}>{member.role.toUpperCase()}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <span style={{ fontSize: '0.6rem', color: 'var(--accent-cyan)' }}>● ONLINE</span>
                      <button onClick={async () => {
                        try {
                          const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');
                          await fetch(`${API_BASE}/api/v1/operators/${member.id}`, { method: 'DELETE' });
                          setTeamMembers(teamMembers.filter(t => t.id !== member.id));
                        } catch (err) { console.error('Failed to remove operator:', err); }
                      }} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
                <button className="btn-outline" style={{ marginTop: '1rem', width: '100%', borderStyle: 'dashed' }} onClick={() => setIsAddingOperator(true)}><UserPlus size={14} /> AUTHORIZE_NEW_OPERATOR</button>
              </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="settings-section">
              <h3><Database size={18} /> VAULT_STORAGE <span className="section-tag">PERSISTENCE</span></h3>
              <div className="persistence-stats">
                <div className="p-stat-card"><div className="p-stat-value">{stats.size}</div><div style={{ fontSize: '0.5rem', opacity: 0.5 }}>VAULT_SIZE</div></div>
                <div className="p-stat-card"><div className="p-stat-value">{stats.integrity}</div><div style={{ fontSize: '0.5rem', opacity: 0.5 }}>INTEGRITY</div></div>
                <div className="p-stat-card"><div className="p-stat-value">{stats.lastBackup}</div><div style={{ fontSize: '0.5rem', opacity: 0.5 }}>STATUS</div></div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".json" onChange={handleRestoreSnapshot} />
                <button className="btn-primary" style={{ flex: 1 }} onClick={handleExportVault}><Download size={14} /> EXPORT_VAULT</button>
                <button className="btn-outline" style={{ flex: 1 }} onClick={() => fileInputRef.current?.click()}><Upload size={14} /> RESTORE_SNAPSHOT</button>
              </div>
            </div>
          )}

          <div className="settings-section" style={{ border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.02)' }}>
            <h3 style={{ color: '#ef4444' }}><Lock size={18} /> DESTRUCTIVE_ACTIONS</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-danger-purge" style={{ flex: 1 }} onClick={() => setConfirmAction('purge')}>PURGE_DATABASE</button>
              <button className="btn-danger-purge" style={{ flex: 1 }} onClick={() => setConfirmAction('reset')}>FACTORY_RESET</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
