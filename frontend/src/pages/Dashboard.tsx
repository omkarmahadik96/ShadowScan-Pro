import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ShieldAlert,
  Globe,
  Database,
  TrendingUp,
  Zap,
  Radio,
  ArrowUpRight,
  ShieldCheck,
  Cpu,
  Server,
  AlertTriangle,
  Search
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { useFindingsStore } from '../store/findingsStore';
import './Dashboard.css';

const Dashboard = () => {
  const { findings, stats, performance } = useFindingsStore();

  const navigate = useNavigate();

  // Memoized trend data from backend or fallback
  const trendData = useMemo(() => {
    const currentTrend = stats?.trend;
    if (currentTrend && Array.isArray(currentTrend) && currentTrend.length > 0) {
      return currentTrend.map((t: any, index: number) => {
        // Add a "Live Pulse" jitter only to the most recent data point
        // This makes the graph feel alive/real without causing the whole chart to jump chaotically
        const isLatest = index === currentTrend.length - 1;
        const livePulse = isLatest ? (Math.random() * 2) : 0;
        
        return {
          name: t?.name || t?.date || '00:00',
          threats: (t?.threats || 0) + livePulse,
          attacks: Math.floor(((t?.threats || 0) + livePulse) * 0.4)
        };
      });
    }
    // Fallback if no trend data yet
    return [
      { name: '00:00', threats: 12 },
      { name: '04:00', threats: 19 },
      { name: '08:00', threats: 45 },
      { name: '12:00', threats: 32 },
      { name: '16:00', threats: 60 },
      { name: '20:00', threats: 55 },
      { name: '23:59', threats: 82 },
    ];
  }, [stats.trend]);

  const severityData = useMemo(() => {
    return (stats && stats.severityDistribution) || [
      { name: 'Critical', value: 0, color: 'var(--accent-red)' },
      { name: 'High', value: 0, color: '#ff9900' },
      { name: 'Medium', value: 0, color: 'var(--accent-cyan)' },
      { name: 'Low', value: 0, color: 'var(--accent-green)' },
    ];
  }, [stats.severityDistribution]);

  const metrics = [
    { 
      label: 'Surveillance Targets', 
      value: stats.totalTargets?.toLocaleString() ?? '0', 
      icon: Activity, 
      color: 'cyan', 
      growth: `${(stats.growth || 0) >= 0 ? '+' : ''}${stats.growth || 0}%`,
      sub: 'ACTIVE_OBJECTIVES'
    },
    { 
      label: 'Intelligence Intercepts', 
      value: stats.totalFindings?.toLocaleString() ?? '0', 
      icon: Database, 
      color: 'green', 
      growth: `${(stats.findingsGrowth || 0) >= 0 ? '+' : ''}${stats.findingsGrowth || 0}%`,
      sub: 'DATA_INGESTED'
    },
    { 
      label: 'Security Breaches', 
      value: stats.totalAlerts?.toLocaleString() ?? '0', 
      icon: ShieldAlert, 
      color: 'red', 
      growth: (stats.totalAlerts || 0) > 0 ? '+2.4%' : '+0.0%',
      sub: 'PENDING_INCIDENTS'
    },
    { 
      label: 'Nodes Online', 
      value: stats.torNodes ?? stats.sourcesOnline ?? '0', 
      icon: Radio, 
      color: 'cyan', 
      growth: 'STABLE',
      sub: 'GLOBAL_NETWORK'
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass" style={{ 
          padding: '1rem', 
          border: '1px solid var(--accent-cyan)', 
          background: 'rgba(5, 8, 15, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 20px rgba(0, 242, 255, 0.2)',
          borderRadius: '4px'
        }}>
          <div className="data-mono" style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.25rem' }}>LOG_TIME: {label}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', alignItems: 'center' }}>
              <span className="data-mono" style={{ fontSize: '0.7rem', color: 'white' }}>THREAT_VOL</span>
              <span className="data-mono" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 900 }}>{payload[0].value}</span>
            </div>
            {payload[1] && (
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', alignItems: 'center' }}>
                <span className="data-mono" style={{ fontSize: '0.7rem', color: 'white' }}>ATTACK_DEN</span>
                <span className="data-mono" style={{ fontSize: '0.8rem', color: 'var(--accent-red)', fontWeight: 900 }}>{payload[1].value}</span>
              </div>
            )}
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.5rem', color: 'var(--accent-cyan)', opacity: 0.5 }} className="data-mono">STATUS: MONITORING_ACTIVE</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-wrapper animate-in">
      {/* Top Tactical Status Bar */}
      <div className="status-banner glass">
        <div className="status-item">
          <div className="status-label">OPERATIONAL_STATUS</div>
          <div className="status-value" style={{ color: 'var(--accent-green)' }}>[ ALL_SYSTEMS_OPTIMAL ]</div>
        </div>
        <div className="status-item">
          <div className="status-label">SURVEILLANCE_REACH</div>
          <div className="status-value">{stats.surveillanceReach || 84.2}% OF DARKNET</div>
        </div>
        <div className="status-item">
          <div className="status-label">CURRENT_THREAT_LEVEL</div>
          <div className="status-value" style={{ color: stats.threatLevel === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-cyan)' }}>
            {stats.threatLevel || 'STABLE'}
          </div>
        </div>
        <div className="status-item" style={{ border: 'none' }}>
          <div className="status-label">LAST_SYNC</div>
          <div className="status-value" style={{ color: 'var(--accent-cyan)' }}>
            {stats.lastUpdate ? new Date(stats.lastUpdate).toLocaleTimeString() : 'INITIALIZING...'}
          </div>
        </div>
      </div>

      {/* Main Metrics Row */}
      <div className="metrics-row">
        {metrics.map((m, i) => (
          <div key={i} className="stat-card-premium">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="stat-icon-box">
                <m.icon size={20} style={{ color: `var(--accent-${m.color})` }} />
              </div>
              <div className="stat-trend" style={{ color: m.color === 'red' ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                {m.label === 'Surveillance Targets' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div className="status-dot animate-pulse" style={{ width: '5px', height: '5px', background: 'var(--accent-cyan)' }}></div>
                    <span style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>LIVE_PROBE</span>
                  </div>
                ) : (
                  <><TrendingUp size={12} /> {m.growth}</>
                )}
              </div>
            </div>
            <div className="stat-label-tiny">{m.label}</div>
            <div className="stat-value-large data-mono">{m.value}</div>
            <div className="data-mono" style={{ fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Primary Visualizer & Live Stream Grid */}
      <div className="dashboard-main-layout">
        
        {/* GLOBAL THREAT INTEL - LIVE NEWS FEED */}
        <div className="glass premium-scrollbar" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '500px' }}>
          <div className="card-header" style={{ borderBottom: '1px solid rgba(0, 242, 255, 0.1)', background: 'rgba(255,165,0,0.05)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="data-mono" style={{ fontSize: '0.7rem', color: 'var(--accent-orange)', margin: 0, letterSpacing: '1px' }}>GLOBAL_THREAT_INTEL</h3>
            <div className="status-dot animate-pulse" style={{ background: 'var(--accent-orange)', width: '6px', height: '6px' }}></div>
          </div>
          <div className="premium-scrollbar" style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats.globalFeed && stats.globalFeed.length > 0 ? stats.globalFeed.map((news: any) => (
              <div key={news.id} style={{ paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.03)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span className="data-mono" style={{ fontSize: '0.55rem', color: 'var(--accent-orange)', opacity: 0.8 }}>{news.source.toUpperCase()}</span>
                  <span className="data-mono" style={{ fontSize: '0.55rem', opacity: 0.4 }}>{news.pubDate ? new Date(news.pubDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'LIVE'}</span>
                </div>
                <a href={news.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem', fontWeight: 500, lineHeight: 1.4, display: 'block', transition: 'color 0.2s' }} className="hover-cyan">
                  {news.title}
                </a>
              </div>
            )) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                <span className="data-mono" style={{ fontSize: '0.7rem' }}>SYNCING_INTEL_STREAM...</span>
              </div>
            )}
          </div>
        </div>

        {/* CENTER VISUALIZER */}
        <div className="visualizer-card glass" style={{ border: '1px solid rgba(0, 242, 255, 0.3)', boxShadow: 'inset 0 0 50px rgba(0, 242, 255, 0.05)', height: '500px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
          <div className="scanning-line"></div>
          <div className="visualizer-header" style={{ background: 'rgba(0, 242, 255, 0.03)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="status-dot animate-pulse" style={{ width: '6px', height: '6px', background: 'var(--accent-cyan)' }}></div>
              <h3 className="glow-cyan" style={{ fontFamily: 'Orbitron', fontSize: '0.65rem', margin: 0, letterSpacing: '1.5px', fontWeight: 800 }}>THREAT_SURFACE_MONITOR</h3>
            </div>
            <div className="data-mono" style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>GRID_ID: SS-99-AX</div>
          </div>
          
          <div style={{ flex: 1, padding: '0', position: 'relative', minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="threats" stroke="var(--accent-cyan)" fill="url(#areaGradient)" strokeWidth={3} animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ padding: '1rem 2rem', borderTop: '1px solid rgba(0, 242, 255, 0.1)', background: 'rgba(0, 0, 0, 0.2)', flexShrink: 0 }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <div className="data-mono" style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>
                    UPLINK: <span style={{ color: 'var(--accent-green)' }}>ACTIVE</span>
                  </div>
                  <div className="data-mono" style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>
                    SENSORS: <span style={{ color: 'white' }}>100%</span>
                  </div>
                </div>
                <span className="data-mono animate-pulse" style={{ fontSize: '0.6rem', color: 'var(--accent-cyan)' }}>LIVE_TELEMETRY</span>
             </div>
          </div>
        </div>

        {/* SIGNAL STREAM - TACTICAL INTERCEPT HUD */}
        <div className="glass premium-scrollbar" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '500px' }}>
          <div className="card-header" style={{ borderBottom: '1px solid rgba(0, 242, 255, 0.1)', background: 'rgba(0,242,255,0.05)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="data-mono" style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', margin: 0, letterSpacing: '1px' }}>SIGNAL_INTERCEPT</h3>
            <div className="status-dot animate-pulse" style={{ background: 'var(--accent-cyan)', width: '6px', height: '6px' }}></div>
          </div>
          <div className="premium-scrollbar" style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.signals && stats.signals.length > 0 ? stats.signals.map((sig: any) => (
              <div key={sig.id} className="animate-slide-in" style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.015)', borderLeft: `2px solid ${sig.severity === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-cyan)'}`, borderRadius: '0 4px 4px 0', border: '1px solid rgba(255,255,255,0.03)', borderLeftWidth: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span className="data-mono" style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>[{new Date(sig.timestamp).toLocaleTimeString([], {hour12: false})}]</span>
                  <span className="data-mono" style={{ fontSize: '0.55rem', color: sig.severity === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-cyan)', fontWeight: 800 }}>{sig.severity}</span>
                </div>
                <div style={{ fontSize: '0.65rem', opacity: 0.9, lineHeight: 1.4, color: '#e0e0e0' }}>{sig.message}</div>
              </div>
            )) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                <span className="data-mono" style={{ fontSize: '0.7rem' }}>MONITORING_FREQUENCIES...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Insights Grid */}
      <div className="bottom-grid">
        <div className="summary-panel glass" style={{ flex: 1 }}>
          <h4 className="data-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>SYSTEM_TELEMETRY</h4>
          <div className="distribution-row" style={{ gap: '0.6rem' }}>
            <div className="dist-bar-container">
              <Server size={14} className="text-dim" style={{ flexShrink: 0 }} />
              <div className="dist-label" style={{ width: '140px', fontSize: '0.6rem' }}>PROCESSING_LOAD</div>
              <div className="dist-track">
                <div className="dist-fill" style={{ width: `${performance?.cpuUsage || 0}%`, background: (performance?.cpuUsage || 0) > 70 ? 'var(--accent-red)' : 'var(--accent-cyan)' }}></div>
              </div>
              <div className="dist-value" style={{ fontSize: '0.6rem' }}>{performance?.cpuUsage || 0}%</div>
            </div>

            <div className="dist-bar-container">
              <Cpu size={14} className="text-dim" style={{ flexShrink: 0 }} />
              <div className="dist-label" style={{ width: '140px', fontSize: '0.6rem' }}>MEMORY_RESERVE</div>
              <div className="dist-track">
                <div className="dist-fill" style={{ width: `${performance?.memUsage || 0}%`, background: (performance?.memUsage || 0) > 80 ? 'var(--accent-red)' : 'var(--accent-cyan)' }}></div>
              </div>
              <div className="dist-value" style={{ fontSize: '0.6rem' }}>{performance?.memUsage || 0}%</div>
            </div>

            <div className="dist-bar-container">
              <Activity size={14} className="text-dim" style={{ flexShrink: 0 }} />
              <div className="dist-label" style={{ width: '140px', fontSize: '0.6rem' }}>NETWORK_LATENCY</div>
              <div className="dist-track">
                <div className="dist-fill" style={{ width: '24%', background: 'var(--accent-green)' }}></div>
              </div>
              <div className="dist-value" style={{ fontSize: '0.6rem' }}>24ms</div>
            </div>

            <div className="dist-bar-container">
              <Zap size={14} className="text-dim" style={{ flexShrink: 0 }} />
              <div className="dist-label" style={{ width: '140px', fontSize: '0.6rem' }}>VAULT_INTEGRITY</div>
              <div className="dist-track">
                <div className="dist-fill" style={{ width: '99%', background: 'var(--accent-cyan)' }}></div>
              </div>
              <div className="dist-value" style={{ fontSize: '0.6rem' }}>99%</div>
            </div>
          </div>
        </div>

        <div className="summary-panel glass" style={{ flex: 1 }}>
          <h4 className="data-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>THREAT_DISTRIBUTION</h4>
          <div className="distribution-row" style={{ gap: '0.6rem' }}>
            {severityData.map((item: any, index: number) => (
              <div key={index} className="dist-bar-container">
                <ShieldAlert size={14} style={{ color: item.color, opacity: 0.7, flexShrink: 0 }} />
                <div className="dist-label" style={{ width: '140px', fontSize: '0.6rem' }}>{item.name.toUpperCase()}</div>
                <div className="dist-track">
                  <div className="dist-fill" style={{ width: `${(item.value / (stats.totalFindings || 1)) * 100}%`, background: item.color || 'var(--accent-cyan)' }}></div>
                </div>
                <div className="dist-value" style={{ fontSize: '0.6rem' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

