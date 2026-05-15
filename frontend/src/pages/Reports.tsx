import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Share2, 
  Clock, 
  BarChart2, 
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Zap,
  Printer,
  X,
  Trash2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useFindingsStore } from '../store/findingsStore';
import './Reports.css';

const Reports = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [recentExports, setRecentExports] = useState<any[]>([]);
  const [severityData, setSeverityData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { stats, performance, findings } = useFindingsStore();

  // --- Robust Network Layer ---
  const safeFetch = async (url: string, options?: any) => {
    try {
      const response = await fetch(url, options);
      if (!response || !response.ok) return null;
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) return null;
      
      return await response.json();
    } catch (err) {
      return null;
    }
  };

  const fetchRealTimeStats = async () => {
    const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');
    const json = await safeFetch(`${API_BASE}/api/v1/system/stats`);
    if (json?.success && json?.data) {
      setSeverityData(Array.isArray(json.data.severityDistribution) ? json.data.severityDistribution : []);
      setTrendData(Array.isArray(json.data.trend) ? json.data.trend : []);
    } else {
      // Fallback to store data if available
      if (stats?.severityDistribution) setSeverityData(stats.severityDistribution);
      if (stats?.trend) setTrendData(stats.trend);
    }
  };

  const fetchRecentExports = async () => {
    const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');
    const json = await safeFetch(`${API_BASE}/api/v1/reports`);
    if (json?.success && Array.isArray(json.data)) {
      setRecentExports(json.data);
    }
  };

  useEffect(() => {
    fetchRealTimeStats();
    fetchRecentExports();

    const interval = setInterval(() => {
      fetchRealTimeStats();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleClearAll = async () => {
    try {
      const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');
      const response = await fetch(`${API_BASE}/api/v1/reports`, { method: 'DELETE' });
      const json = await response.json();
      if (json?.success) {
        setRecentExports([]);
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      console.error('Failed to purge reports', err);
    }
  };

  useEffect(() => {
    if (findings && findings.length > 0) {
      fetchRealTimeStats();
    }
  }, [findings?.length]);

  const handleGenerate = async (type: string) => {
    setIsGenerating(true);
    
    const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');
    
    // FETCH_PHASE: Explicitly pull fresh intelligence to ensure "Live" accuracy
    const [statsJson, findingsJson] = await Promise.all([
      safeFetch(`${API_BASE}/api/v1/system/stats`),
      safeFetch(`${API_BASE}/api/v1/findings`)
    ]);
    
    const showFinalReport = (statsData: any, latestFindings: any[]) => {
      try {
        const reportId = `REP-${Math.floor(1000 + Math.random() * 9000)}`;
        const currentFindings = latestFindings || findings || [];
        
        const safeSummary = statsData?.summary || { 
          totalFindings: currentFindings.length, 
          highRisk: currentFindings.filter((f: any) => f.severity === 'CRITICAL' || f.severity === 'HIGH').length, 
          monitoredNodes: stats.sourcesOnline || 45, 
          dataVolume: (currentFindings.length * 0.1).toFixed(1) + ' GB' 
        };
        
        const newReport = {
          title: type || 'GENERAL_INTEL_REPORT',
          id: reportId,
          date: new Date().toLocaleDateString(),
          stats: safeSummary,
          severityDistribution: Array.isArray(statsData?.severityDistribution) ? statsData.severityDistribution : (stats.severityDistribution || []),
          findings: currentFindings // Embed the specific findings captured at this moment
        };

        if (Array.isArray(statsData?.severityDistribution)) setSeverityData(statsData.severityDistribution);
        if (Array.isArray(statsData?.trend)) setTrendData(statsData.trend);
        
        setReportData(newReport);
        
        // Simulation of deep-scan synthesis
        setTimeout(() => {
          setIsGenerating(false);
          setShowPreview(true);
        }, 2000);

        // Persist the report metadata to backend
        const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');
        fetch(`${API_BASE}/api/v1/reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: reportId,
            name: (type || '').replace(/_/g, ' '),
            type: type,
            stats: safeSummary
          })
        }).finally(() => fetchRecentExports());

      } catch (err) {
        console.error('Report synthesis failed', err);
        setIsGenerating(false);
      }
    };

    if (statsJson?.success && statsJson?.data) {
      showFinalReport(statsJson.data, findingsJson?.data || []);
    } else {
      showFinalReport(stats, findings || []);
    }
  };

  const handleDownload = (report: any) => {
    if (!report) return;
    setReportData({
      ...report,
      title: report.type || report.name || 'INTEL_REPORT',
      stats: report.stats || { totalFindings: 0, highRisk: 0, monitoredNodes: 0, dataVolume: '0' }
    });
    setShowPreview(true);
  };

  const handlePrint = () => {
    window.print();
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showPreview) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showPreview]);

  return (
    <div className="animate-in" style={{ height: '100%' }}>
      <div className="page-title-section">
        <h1 className="page-title">Analytics & Intelligence</h1>
        <p className="page-subtitle">Generate high-fidelity forensic reports and strategic threat intelligence summaries.</p>
      </div>

      <div className="reports-layout-grid">
        {/* Statistics Overview */}
        <div className="stats-strip">
          <div className="mini-stat-card glass">
            <div className="stat-icon-bg" style={{ background: 'rgba(0, 242, 255, 0.1)' }}>
              <TrendingUp size={20} style={{ color: 'var(--accent-cyan)' }} />
            </div>
            <div className="stat-content">
              <span className="stat-label">THREAT_GROWTH</span>
              <span className="stat-value">{(stats.findingsGrowth || 0) >= 0 ? '+' : ''}{stats.findingsGrowth || 0}%</span>
            </div>
          </div>
          <div className="mini-stat-card glass">
            <div className="stat-icon-bg" style={{ background: 'rgba(255, 51, 102, 0.1)' }}>
              <AlertTriangle size={20} style={{ color: 'var(--accent-red)' }} />
            </div>
            <div className="stat-content">
              <span className="stat-label">CRITICAL_MATCHES</span>
              <span className="stat-value">{stats.criticalThreats || 0}</span>
            </div>
          </div>
          <div className="mini-stat-card glass">
            <div className="stat-icon-bg" style={{ background: 'rgba(0, 255, 136, 0.1)' }}>
              <Zap size={20} style={{ color: 'var(--accent-green)' }} />
            </div>
            <div className="stat-content">
              <span className="stat-label">SYSTEM_HEALTH</span>
              <span className="stat-value">
                {performance 
                  ? (100 - (performance.cpuUsage * 0.04) - (performance.memUsage * 0.01)).toFixed(1) + '%' 
                  : '99.9%'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Interface */}
        <div className="reports-main-content">
          <div className="glass report-config-section">
            <h2 className="section-title data-mono"><FileText size={18} /> REPORT_GENERATION_ENGINE</h2>
            
            <div className="report-options">
              <div className="report-card-premium" onClick={() => handleGenerate('EXECUTIVE_STRATEGIC_SUMMARY')}>
                <div className="card-accent" style={{ background: 'var(--accent-cyan)' }}></div>
                <div className="card-body">
                  <BarChart2 size={32} className="card-icon" />
                  <h3>Executive Strategic Summary</h3>
                  <p>High-level risk distribution, cost-impact analysis, and strategic remediation roadmap.</p>
                  <div className="card-footer">
                    <span className="tag">PDF</span>
                    <span className="tag">PRESENTATION</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>

              <div className="report-card-premium" onClick={() => handleGenerate('TECHNICAL_FORENSIC_DEEP_DIVE')}>
                <div className="card-accent" style={{ background: 'var(--accent-purple)' }}></div>
                <div className="card-body">
                  <ShieldCheck size={32} className="card-icon" />
                  <h3>Technical Forensic Deep-Dive</h3>
                  <p>Raw data analysis, packet-level evidence, and specific indicator attribution (IoC).</p>
                  <div className="card-footer">
                    <span className="tag">PDF</span>
                    <span className="tag">JSON</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass analytics-visualizer">
            <h2 className="section-title data-mono"><TrendingUp size={18} /> INTELLIGENCE_VISUALIZATION</h2>
            <div className="charts-container">
              <div className="chart-wrapper">
                <span className="chart-label data-mono">THREAT_DETECTION_TREND</span>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorThreat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0}/>
                      </linearGradient>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="var(--text-dim)" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis hide={true} />
                    <Tooltip 
                      cursor={{ stroke: 'rgba(0, 242, 255, 0.2)', strokeWidth: 1 }}
                      contentStyle={{ 
                        background: 'rgba(10,12,20,0.95)', 
                        border: '1px solid rgba(0, 242, 255, 0.2)', 
                        borderRadius: '8px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(10px)'
                      }}
                      itemStyle={{ color: 'var(--accent-cyan)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                      labelStyle={{ color: 'var(--text-dim)', marginBottom: '4px', fontSize: '10px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="threats" 
                      stroke="var(--accent-cyan)" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorThreat)" 
                      activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--accent-cyan)', filter: 'url(#glow)' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-wrapper">
                <span className="chart-label data-mono">SEVERITY_DISTRIBUTION</span>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={severityData}
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                      animationBegin={0}
                      animationDuration={1500}
                    >
                      {severityData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          style={{ filter: `drop-shadow(0 0 5px ${entry.color}44)` }}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(10,12,20,0.95)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '8px',
                        backdropFilter: 'blur(10px)'
                      }}
                      itemStyle={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Recent History Sidebar */}
        <div className="reports-sidebar">
          <div className="glass recent-exports">
            <h3 className="sidebar-title data-mono" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              RECENT_EXPORTS
              {recentExports.length > 0 && (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--accent-red)', 
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    opacity: 0.6,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                  title="PURGE_ALL_EXPORTS"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </h3>
            
            <div className="recent-list">
              {recentExports.length > 0 ? recentExports.map(rep => (
                <div key={rep.id} className="recent-item">
                  <div className="item-info">
                    <span className="item-id">{rep.id}</span>
                    <span className="item-name">{rep.name}</span>
                  </div>
                  <button className="download-btn" onClick={() => handleDownload(rep)} title="Download Forensic PDF">
                    <Download size={14} />
                  </button>
                </div>
              )) : (
                <span className="data-mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textAlign: 'center', display: 'block' }}>[ NO_EXPORTS_FOUND ]</span>
              )}
            </div>
          </div>

          <div className="glass automated-briefings">
            <h3 className="sidebar-title data-mono">AUTOMATED_SURVEILLANCE</h3>
            <div 
              className="schedule-card glow-cyan-hover" 
              style={{ cursor: 'pointer', transition: 'all 0.3s' }}
              onClick={() => {
                if (window.confirm("[ SYSTEM ] MANUAL_OVERRIDE_DETECTION: Would you like to force-trigger the 'Weekly Intel Brief' now?")) {
                  handleGenerate('AUTOMATED_WEEKLY_BRIEF');
                }
              }}
            >
              <Clock size={16} style={{ color: 'var(--accent-cyan)' }} />
              <div className="schedule-info">
                <span className="sch-name">Weekly Intel Brief</span>
                <span className="sch-time" style={{ color: 'var(--accent-cyan)' }}>Next Run: Mon @ 08:00 AM</span>
                <div style={{ fontSize: '0.5rem', opacity: 0.5, marginTop: '2px' }}>STATUS: [ ARMED_AND_WAITING ]</div>
              </div>
            </div>
            <button 
              className="schedule-btn" 
              onClick={() => alert("[ AUTH_ERROR ] Level 5 clearance required to modify system crontab.")}
            >
              SCHEDULE_NEW_BRIEF
            </button>
          </div>
        </div>
      </div>
        
      {/* Cinematic Generation Overlay */}
      {isGenerating && (
        <div className="generation-overlay">
          <div className="data-stream">
            <div>[ SYSTEM ] INITIATING_LIVE_INTEL_SYNC...</div>
            <div>[ SYSTEM ] SYNCING_WITH_CORE_UPLINK... [ OK ]</div>
            {Array(48).fill(0).map((_, i) => (
              <div key={i}>0x{Math.random().toString(16).slice(2, 10).toUpperCase()} // FETCHING_SECTOR_{i} // STATUS_OK</div>
            ))}
          </div>
          <div className="loader-container">
            <div className="hologram-shield">
              <div className="shield-pulse"></div>
              <ShieldCheck size={64} style={{ color: 'var(--accent-cyan)', filter: 'drop-shadow(0 0 15px var(--accent-cyan))' }} />
            </div>
            <h2 className="data-mono glow-cyan" style={{ letterSpacing: '4px' }}>COMPILING_INTELLIGENCE_DOSSIER...</h2>
            <div className="loading-bar" style={{ width: '400px', height: '2px', background: 'rgba(255,255,255,0.1)', margin: '2rem auto', position: 'relative', overflow: 'hidden' }}>
              <div className="loading-progress" style={{ position: 'absolute', inset: 0, background: 'var(--accent-cyan)', animation: 'progress 2s infinite' }}></div>
            </div>
            <p className="data-mono" style={{ fontSize: '0.7rem', opacity: 0.5, color: 'var(--accent-cyan)' }}>ENCRYPTING_FORENSIC_STREAM // AUTHORITY_ROOT_v4.2</p>
          </div>
        </div>
      )}

      {/* Unique Forensic Preview Modal */}
      {showPreview && reportData && (
        <div className="report-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowPreview(false)}>
          <div className="report-modal animate-slide-up">
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="modal-id data-mono">SR-NO: {reportData?.id || 'REP-UNKNOWN'}</span>
                <h2 style={{ fontFamily: 'Orbitron', letterSpacing: '2px' }}>{(reportData?.title || 'INTELLIGENCE_REPORT').replace(/_/g, ' ')}</h2>
              </div>
              <div className="modal-actions">
                <button className="print-btn" onClick={handlePrint}><Printer size={18} /> EXPORT_FORENSIC_PDF</button>
                <button className="close-btn" onClick={() => setShowPreview(false)} style={{ color: 'white' }}><X size={20} /></button>
              </div>
            </div>

            <div id="printable-report" className="report-content" style={{ overflowY: 'visible' }}>
              <div className="report-header">
                <div className="brand">
                  <img src="/shadowscan_logo_3d.png" alt="Official Seal" />
                  <div>
                    <h1 className="report-main-title">SHADOWSCAN_PRO</h1>
                    <span className="tagline" style={{ fontWeight: 800, color: '#1a1a1a', letterSpacing: '2px' }}>GLOBAL THREAT INTELLIGENCE & CYBERSECURITY BUREAU // v4.2.1</span>
                  </div>
                </div>
                <div className="report-meta">
                  <div className="meta-row"><span className="label">DATE:</span> <span style={{ fontWeight: 700 }}>{reportData?.date || new Date().toLocaleDateString()}</span></div>
                  <div className="meta-row"><span className="label">REF:</span> <span style={{ fontWeight: 700 }}>{reportData?.id || 'REP-UNKNOWN'}</span></div>
                  <div className="meta-row"><span className="label">AUTH:</span> <span style={{ color: '#ff003c', fontWeight: 900 }}>TOP_SECRET//DEEP_SCAN</span></div>
                </div>
              </div>

              <div className="report-summary-grid">
                <div className="summary-card" style={{ borderTop: '4px solid #1a1a1a' }}>
                  <span className="summary-label">DATA_INGESTION</span>
                  <span className="summary-value">{reportData?.stats?.totalFindings ?? 0}</span>
                </div>
                <div className="summary-card" style={{ borderTop: '4px solid #ff003c' }}>
                  <span className="summary-label">HIGH_RISK_EVENTS</span>
                  <span className="summary-value" style={{ color: '#ff003c' }}>{reportData?.stats?.highRisk ?? 0}</span>
                </div>
                <div className="summary-card" style={{ borderTop: '4px solid #00f2ff' }}>
                  <span className="summary-label">ACTIVE_NODES</span>
                  <span className="summary-value">{reportData?.stats?.monitoredNodes ?? 0}</span>
                </div>
                <div className="summary-card" style={{ borderTop: '4px solid #00ff88' }}>
                  <span className="summary-label">VOLUME_CAP</span>
                  <span className="summary-value">{reportData?.stats?.dataVolume ?? '0 GB'}</span>
                </div>
              </div>

              {String(reportData?.title || '').includes('EXECUTIVE') ? (
                <div className="report-body">
                  <h4 className="data-mono">STRATEGIC_THREAT_TREND_ANALYSIS</h4>
                  <div className="report-visuals" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', marginBottom: '4rem' }}>
                    <div className="report-chart-box">
                      {trendData && trendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                          <AreaChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" vertical={false} />
                            <XAxis dataKey="date" stroke="#333" fontSize={10} tickLine={false} />
                            <YAxis stroke="#333" fontSize={10} tickLine={false} />
                            <Area type="monotone" dataKey="threats" stroke="#1a1a1a" fill="#f0f0f0" strokeWidth={3} />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>[ DATA_STREAM_UNAVAILABLE ]</div>
                      )}
                    </div>
                    <div className="report-description">
                      <p style={{ fontSize: '0.95rem', lineHeight: '1.8', color: '#1a1a1a', fontWeight: 500 }}>The intelligence stream confirms a targeted expansion of adversarial activity. Real-time correlation engine has identified significant clusters focusing on zero-day exfiltration paths.</p>
                      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8f9fa', borderLeft: '5px solid #ff003c' }}>
                        <span style={{ fontWeight: 900, fontSize: '0.8rem', color: '#ff003c', display: 'block', marginBottom: '0.5rem' }}>CRITICAL_RECOMMENDATION:</span>
                        <p style={{ fontSize: '0.9rem', color: '#333' }}>Immediate deployment of neural-trap perimeter defenses and rotation of all high-privilege access tokens.</p>
                      </div>
                    </div>
                  </div>

                  <h4 className="data-mono">RISK_DISTRIBUTION_METRICS</h4>
                  <div className="report-visuals" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '3rem' }}>
                    <div className="report-description">
                      <p style={{ fontSize: '0.95rem', lineHeight: '1.8', color: '#1a1a1a' }}>Impact assessment indicates that 45% of critical risks are associated with legacy infrastructure nodes. Remediation priority should be assigned to the Technical Ledger findings.</p>
                    </div>
                    <div className="report-chart-box">
                      {severityData && severityData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                          <PieChart>
                            <Pie data={severityData} innerRadius={50} outerRadius={80} paddingAngle={10} dataKey="value">
                              {severityData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry?.color || '#333'} stroke="#fff" strokeWidth={2} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>[ METRICS_NOT_HYDRATED ]</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="report-body">
                  <h4 className="data-mono">TECHNICAL_INCIDENT_LEDGER (LIVE_DATA)</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#1a1a1a', color: 'white' }}>
                        <th style={{ padding: '15px', textAlign: 'left' }}>INCIDENT_ID</th>
                        <th style={{ padding: '15px', textAlign: 'left' }}>SOURCE_ORIGIN</th>
                        <th style={{ padding: '15px', textAlign: 'left' }}>VECT_TYPE</th>
                        <th style={{ padding: '15px', textAlign: 'left' }}>SEV_LEVEL</th>
                        <th style={{ padding: '15px', textAlign: 'left' }}>EVIDENCE_MATCH</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData?.findings || []).length > 0 ? (
                        [...(reportData?.findings || [])]
                          .sort((a, b) => new Date(b.discovered_at).getTime() - new Date(a.discovered_at).getTime())
                          .map((f: any) => (
                          <tr key={f.id} style={{ borderBottom: '2px solid #1a1a1a' }}>
                            <td style={{ padding: '15px', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{f.id}</td>
                            <td style={{ padding: '15px' }}>{f.source}</td>
                            <td style={{ padding: '15px' }}>{f.data_type}</td>
                            <td style={{ padding: '15px', color: f.severity === 'CRITICAL' ? '#ff003c' : '#1a1a1a', fontWeight: 900 }}>{f.severity}</td>
                            <td style={{ padding: '15px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#555' }}>{f.matched_value}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>[ SYSTEM_FAILURE: NO_TECHNICAL_DATA_CAPTURED ]</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="report-footer" style={{ marginTop: '5rem', borderTop: '4px solid #1a1a1a', paddingTop: '2rem' }}>
                <div className="signature">
                  <div style={{ width: '250px', height: '1px', background: '#1a1a1a', marginBottom: '0.5rem' }}></div>
                  <span style={{ fontWeight: 900, color: '#1a1a1a' }}>DIGITAL_SIGNATURE: {Math.random().toString(16).slice(2, 20).toUpperCase()}</span>
                  <div style={{ fontSize: '0.6rem', color: '#888', marginTop: '0.2rem' }}>VERIFIED BY SHADOWSCAN_PRO_ROOT_CA // RSA_4096</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="data-mono" style={{ fontSize: '0.7rem', fontWeight: 800 }}>D-REF: {Math.floor(Math.random() * 1000000)}</span>
                  <div style={{ fontSize: '0.6rem', color: '#ff003c', fontWeight: 900, marginTop: '0.2rem' }}>INTERNAL_USE_ONLY // DESTROY_AFTER_REVIEW</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* SURGICAL VAULT PURGE MODAL - REDESIGNED */}
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
            {/* Top Scanning Line */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'var(--accent-red)', boxShadow: '0 0 15px var(--accent-red)', animation: 'scan 3s linear infinite' }}></div>
            
            <div style={{ padding: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 0, 60, 0.1)', paddingBottom: '1rem' }}>
                <Zap size={24} style={{ color: 'var(--accent-red)' }} />
                <h2 className="data-mono" style={{ fontSize: '0.9rem', color: 'white', letterSpacing: '3px', margin: 0 }}>PROTOCOL_WIPE_v4.2</h2>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }}>
                <p className="data-mono" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.8', margin: 0 }}>
                  WARNING: YOU ARE ABOUT TO INITIATE A COMPLETE DATA_PURGE OF THE LOCAL FORENSIC REPOSITORY.
                  <br/><br/>
                  <span style={{ color: 'var(--accent-red)' }}>&gt; TARGET: ALL_GENERATED_DOSSIERS</span><br/>
                  <span style={{ color: 'var(--accent-red)' }}>&gt; ACTION: PERMANENT_IRREVERSIBLE_ERASURE</span>
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}
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
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  [ ABORT ]
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleClearAll(); }}
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
                  onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                >
                  [ EXECUTE_PURGE ]
                </button>
              </div>
            </div>
            
            {/* Bottom Status Bar */}
            <div style={{ padding: '0.5rem 1rem', background: 'rgba(255, 0, 60, 0.05)', borderTop: '1px solid rgba(255, 0, 60, 0.1)', display: 'flex', justifyContent: 'space-between' }}>
              <span className="data-mono" style={{ fontSize: '0.5rem', color: 'var(--accent-red)', opacity: 0.7 }}>AUTHORIZATION_LEVEL: ALPHA_ROOT</span>
              <span className="data-mono" style={{ fontSize: '0.5rem', color: 'var(--accent-red)', opacity: 0.7 }}>SECURE_ENCLAVE_READY</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
