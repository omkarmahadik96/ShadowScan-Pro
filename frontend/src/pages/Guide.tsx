import React from 'react';
import { 
  BookOpen, 
  LayoutDashboard, 
  Search, 
  Bell, 
  Eye, 
  Activity, 
  Users, 
  FileText, 
  Settings,
  Shield,
  Zap,
  Cpu,
  Globe,
  Terminal,
  ChevronRight
} from 'lucide-react';
import './Findings.css'; // Reusing some glass styles

const Guide = () => {
  const sections = [
    {
      id: 'dark-web-automation',
      title: 'DARK_WEB_AUTOMATION_KERNEL',
      icon: Zap,
      color: 'var(--accent-cyan)',
      description: 'FEATURES: Autonomous multi-threaded crawling, onion service indexing, and data-leak identification.',
      work: 'HOW_TO_USE: Activate the engine in Settings. The crawler will automatically scan hidden services based on your keywords.',
      how: 'BENEFIT: Provides 24/7 dark web coverage with zero manual effort, uncovering threats before they escalate.',
      effect: 'REAL_WORLD_USE: Identifying stolen corporate credentials, leaked database dumps, and illicit market trends.'
    },
    {
      id: 'telegram-integration',
      title: 'TELEGRAM_ALERT_MATRIX',
      icon: Bell,
      color: 'var(--accent-red)',
      description: 'FEATURES: Real-time notification mirroring, mobile telemetry, and encrypted alert broadcasts.',
      work: 'HOW_TO_USE: Enter your Bot Token in the Security module. High-severity threats will push directly to your Telegram.',
      how: 'BENEFIT: Remote monitoring capability ensures you never miss a critical breach, even while away from the terminal.',
      effect: 'REAL_WORLD_USE: Immediate response to server downtime, database breaches, or unauthorized access attempts.'
    },
    {
      id: 'investigation-graph',
      title: 'TACTICAL_RELATIONSHIP_MAP',
      icon: Eye,
      color: 'var(--accent-blue)',
      description: 'FEATURES: Force-directed relationship graphing, node-link analysis, and threat actor mapping.',
      work: 'HOW_TO_USE: Navigate to Investigation. Click any node to reveal its digital fingerprints and hidden connections.',
      how: 'BENEFIT: Visualizes complex data webs, making it easy to see the "Who" and "How" behind an attack.',
      effect: 'REAL_WORLD_USE: Tracking money laundering paths, hacker group infrastructure, and coordinated disinformation campaigns.'
    },
    {
      id: 'forensic-dossier',
      title: 'FORENSIC_DOSSIER_GEN',
      icon: FileText,
      color: 'var(--accent-cyan)',
      description: 'FEATURES: PDF/JSON export engine, automatic UI suppression, and structured evidence aggregation.',
      work: 'HOW_TO_USE: Select intelligence findings and click Generate. Use "Strategic" for management and "Technical" for labs.',
      how: 'BENEFIT: Creates legal-grade documentation that is formatted for professional administrative or forensic review.',
      effect: 'REAL_WORLD_USE: Creating court-ready evidence, corporate incident reports, and technical handover dossiers.'
    },
    {
      id: 'geo-intel',
      title: 'GLOBAL_GEO_INTELLIGENCE',
      icon: Globe,
      color: 'var(--accent-cyan)',
      description: 'FEATURES: 3D spatial mapping, IP-to-Geo correlation, and real-time threat-origin visualization.',
      work: 'HOW_TO_USE: Toggle the Globe panel in the Stealth Bar. Hover over hotspots to see server locations and attack vectors.',
      how: 'BENEFIT: Identifies geographical risk clusters and identifies state-sponsored or regional adversary locations.',
      effect: 'REAL_WORLD_USE: Identifying regional phishing campaigns, tracking the physical location of C2 servers, and regional threat analysis.'
    }
  ];

  return (
    <div className="animate-in" style={{ paddingBottom: '4rem' }}>
      <div className="page-title-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Operator Handbook</h1>
          <p className="page-subtitle">A comprehensive tactical guide to the ShadowScan Pro surveillance suite.</p>
        </div>
        <div className="doc-id-banner glass" style={{ padding: '0.75rem 1.5rem', borderLeft: '4px solid var(--accent-cyan)', width: 'fit-content', marginTop: '0.5rem' }}>
          <div className="data-mono" style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>DOCUMENT_ID</div>
          <div className="data-mono" style={{ fontSize: '0.85rem', color: 'white', letterSpacing: '1px' }}>MANUAL_v4.2.8_FINAL</div>
        </div>
      </div>

      <div className="guide-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
        {sections.map((section) => (
          <div key={section.id} className="glass slide-in" style={{ 
            padding: '2rem', 
            position: 'relative', 
            overflow: 'hidden',
            borderTop: `4px solid ${section.color}`
          }}>
            {/* Background Decorative Icon */}
            <section.icon size={120} style={{ 
              position: 'absolute', 
              top: '-20px', 
              right: '-20px', 
              opacity: 0.03, 
              transform: 'rotate(-15deg)',
              pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '8px', 
                background: `${section.color}15`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: `1px solid ${section.color}30`
              }}>
                <section.icon size={24} style={{ color: section.color }} />
              </div>
              <h3 className="data-mono" style={{ margin: 0, fontSize: '1.1rem', letterSpacing: '2px', color: 'white' }}>{section.title}</h3>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              {section.description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="glass" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: 'none' }}>
                <span className="data-mono" style={{ fontSize: '0.65rem', color: section.color, display: 'block', marginBottom: '0.4rem' }}>&raquo; OPERATIONAL_FUNCTION</span>
                <span style={{ fontSize: '0.85rem', color: 'white' }}>{section.work}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span className="data-mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>USAGE_PROTOCOL</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{section.how}</span>
                </div>
                <div>
                  <span className="data-mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>EXPECTED_RESULT</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{section.effect}</span>
                </div>
              </div>
            </div>

            </div>
        ))}
      </div>

      {/* Real-World Tactical Applications Section */}
      <div className="section-divider" style={{ margin: '5rem 0 3rem', textAlign: 'center' }}>
        <div style={{ width: '1px', height: '60px', background: 'var(--accent-cyan)', margin: '0 auto 1.5rem', opacity: 0.3 }}></div>
        <h2 className="data-mono" style={{ letterSpacing: '8px', fontSize: '1.5rem', color: 'white' }}>TACTICAL_DEPLOYMENT</h2>
        <p className="data-mono" style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', marginTop: '0.5rem' }}>REAL_WORLD_APPLICATION_PROTOCOLS</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        <div className="glass" style={{ padding: '2.5rem', borderLeft: '4px solid var(--accent-green)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Shield size={24} style={{ color: 'var(--accent-green)' }} />
            <h3 className="data-mono" style={{ margin: 0, color: 'white' }}>CORPORATE_DATA_DEFENSE</h3>
          </div>
          <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', paddingLeft: '1.2rem', lineHeight: '1.8' }}>
            <li><strong>Brand Protection:</strong> Monitor the darknet for fake websites or apps using your company name.</li>
            <li><strong>Leak Detection:</strong> Automatically find if your employees' emails or passwords are sold in data breaches.</li>
            <li><strong>Insider Threat:</strong> Detect if sensitive internal documents are being traded by malicious actors.</li>
          </ul>
          <div className="data-mono" style={{ marginTop: '1.5rem', fontSize: '0.6rem', color: 'var(--accent-green)' }}>PRIMARY_USE: Fortune 500 & Tech Enterprises</div>
        </div>

        <div className="glass" style={{ padding: '2.5rem', borderLeft: '4px solid var(--accent-blue)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Users size={24} style={{ color: 'var(--accent-blue)' }} />
            <h3 className="data-mono" style={{ margin: 0, color: 'white' }}>LAW_ENFORCEMENT_&_FORENSICS</h3>
          </div>
          <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', paddingLeft: '1.2rem', lineHeight: '1.8' }}>
            <li><strong>Criminal Profiling:</strong> Use the "Adversaries" tool to track known hacker groups and their patterns.</li>
            <li><strong>Evidence Gathering:</strong> Use "Forensic Reporting" to create legal-grade PDF dossiers for court cases.</li>
            <li><strong>Link Analysis:</strong> Use "Investigation" to see connections between different crime scenes in the digital world.</li>
          </ul>
          <div className="data-mono" style={{ marginTop: '1.5rem', fontSize: '0.6rem', color: 'var(--accent-blue)' }}>PRIMARY_USE: Cyber-Crime Units & Intelligence Agencies</div>
        </div>

        <div className="glass" style={{ padding: '2.5rem', borderLeft: '4px solid var(--accent-red)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Zap size={24} style={{ color: 'var(--accent-red)' }} />
            <h3 className="data-mono" style={{ margin: 0, color: 'white' }}>FINANCIAL_INTELLIGENCE</h3>
          </div>
          <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', paddingLeft: '1.2rem', lineHeight: '1.8' }}>
            <li><strong>Fraud Prevention:</strong> Detect stolen credit card numbers or bank account details before they are used.</li>
            <li><strong>Crypto Tracking:</strong> Monitor wallets and transaction hashes linked to ransomware or money laundering.</li>
            <li><strong>Market Stability:</strong> Identify large-scale financial breaches that could impact stock markets.</li>
          </ul>
          <div className="data-mono" style={{ marginTop: '1.5rem', fontSize: '0.6rem', color: 'var(--accent-red)' }}>PRIMARY_USE: Banks & Fintech Security Teams</div>
        </div>

        <div className="glass" style={{ padding: '2.5rem', borderLeft: '4px solid var(--accent-cyan)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Activity size={24} style={{ color: 'var(--accent-cyan)' }} />
            <h3 className="data-mono" style={{ margin: 0, color: 'white' }}>PERSONAL_SECURITY_AUDIT</h3>
          </div>
          <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', paddingLeft: '1.2rem', lineHeight: '1.8' }}>
            <li><strong>Identity Theft:</strong> Check if your personal phone number, SSN, or address is leaked online.</li>
            <li><strong>Account Recovery:</strong> Find out which of your accounts need a password change after a big leak.</li>
            <li><strong>Privacy Monitoring:</strong> Keep a watch on your family or personal brand to stay safe from stalkers.</li>
          </ul>
          <div className="data-mono" style={{ marginTop: '1.5rem', fontSize: '0.6rem', color: 'var(--accent-cyan)' }}>PRIMARY_USE: High-Profile Individuals & Privacy Professionals</div>
        </div>
      </div>

      <div className="glass" style={{ 
        marginTop: '6rem', 
        padding: '4rem 2rem', 
        textAlign: 'center', 
        background: 'radial-gradient(circle at center, rgba(0, 242, 255, 0.05) 0%, transparent 70%)',
        border: '1px solid rgba(0, 242, 255, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Futuristic Scanline Effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--accent-cyan), transparent)',
          opacity: 0.3,
          animation: 'scan-down 4s linear infinite'
        }}></div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'rgba(0, 242, 255, 0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 2rem',
            border: '2px solid var(--accent-cyan)',
            boxShadow: '0 0 30px rgba(0, 242, 255, 0.2)'
          }}>
            <Shield size={40} className="pulse" style={{ color: 'var(--accent-cyan)' }} />
          </div>
          
          <h2 className="data-mono operational-status-title" style={{ letterSpacing: '6px', fontSize: '1.8rem', color: 'white', marginBottom: '1.5rem' }}>
            OPERATIONAL_STATUS: <span style={{ color: 'var(--accent-cyan)' }}>FULLY_STABILIZED</span>
          </h2>
          
          <p style={{ maxWidth: '700px', margin: '0 auto', color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.8' }}>
            The ShadowScan Pro kernel has achieved full synchronization with the global intelligence mesh. 
            All tactical modules are hot-swappable and ready for immediate forensic orchestration. 
            Deploy with absolute confidence and maintain protocol integrity at all times.
          </p>

          <div className="guide-footer-status" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '3rem', 
            marginTop: '3rem',
            padding: '1.5rem',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <div className="data-mono" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 10px var(--accent-green)' }}></div>
              CRAWLER_CORE: ONLINE
            </div>
            <div className="data-mono" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-cyan)', boxShadow: '0 0 10px var(--accent-cyan)' }}></div>
              INTELLIGENCE_MESH: SYNCED
            </div>
            <div className="data-mono" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-purple)', boxShadow: '0 0 10px var(--accent-purple)' }}></div>
              KERNEL_AUTH: GRANTED
            </div>
          </div>
        </div>
      </div>

      {/* Final Professional Validation */}
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <div className="glass" style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 2rem', borderRadius: '40px', border: '1px solid rgba(0, 255, 136, 0.2)' }}>
          <Shield size={16} style={{ color: '#00ff88' }} />
          <span className="data-mono" style={{ fontSize: '0.7rem', color: '#00ff88', letterSpacing: '2px' }}>PROFESSIONAL_INVESTIGATION_TOOL // REAL_TIME_VERIFIED</span>
        </div>
      </div>
    </div>
  );
};

export default Guide;
