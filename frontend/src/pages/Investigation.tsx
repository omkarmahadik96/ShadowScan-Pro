import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { 
  Network, 
  Search, 
  Layers, 
  Terminal,
  Activity,
  ShieldAlert
} from 'lucide-react';
import { useFindingsStore } from '../store/findingsStore';

const Investigation = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const { findings, setFindings } = useFindingsStore();

  const fetchTopologyData = () => {
    setSelectedNode(null); // Reset inspector
    fetch('/api/v1/findings')
      .then(res => {
        if (!res.ok) throw new Error('API down');
        return res.json();
      })
      .then(json => {
        if (json.success && json.data) setFindings(json.data);
      })
      .catch(err => {
        console.warn('Backend unavailable. Using local state.', err);
      });
  };

  useEffect(() => {
    // Initial fetch on mount
    fetchTopologyData();
  }, []);

  const simulationRef = useRef<any>(null);
  const zoomRef = useRef<any>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Build dynamic nodes and links from real findings
    const nodesMap = new Map();
    const linksMap = new Map();

    nodesMap.set('Core_Hub', { id: 'Core_Hub', type: 'target', label: 'Surveillance Hub' });

    // LIMIT FINDINGS FOR PERFORMANCE: FOCUS ON LATEST 50 OBJECTS
    // Fixed sorting to handle multiple date field formats
    const prioritizedFindings = (findings || [])
      .sort((a, b) => {
        const dateA = new Date(a.discoveredAt || a.discovered_at || 0).getTime();
        const dateB = new Date(b.discoveredAt || b.discovered_at || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 50);

    prioritizedFindings.forEach((f: any, index: number) => {
      if (!f) return;
      
      // Use a robust unique ID for the finding node
      const fId = f.id || f._id || `F_${index}_${Date.now()}`;
      const sourceName = (f.source || 'INTEL_NODE').toUpperCase();
      const sourceId = `SRC_${sourceName}`;

      // 1. Create/Retrieve Source node
      if (!nodesMap.has(sourceId)) {
        nodesMap.set(sourceId, { 
          id: sourceId, 
          type: 'source', 
          label: sourceName.replace('MONITOR', '').replace('SOURCE', '').trim() 
        });
        linksMap.set(`Core_Hub-${sourceId}`, { source: 'Core_Hub', target: sourceId });
      }

      // 2. Create finding node linked to its source
      const valId = `VAL_${fId}`; 
      if (!nodesMap.has(valId)) {
        const displayLabel = `${(f.data_type || 'INTEL').toUpperCase()}: ${(f.matchedValue || f.matched_value || 'DATA').substring(0, 15)}...`;
        
        nodesMap.set(valId, { 
          id: valId, 
          type: 'asset', 
          label: displayLabel, 
          finding: f,
          isNew: (Date.now() - new Date(f.discoveredAt || f.discovered_at || 0).getTime()) < 30000 // Mark if discovered in last 30s
        });
        linksMap.set(`${sourceId}-${valId}`, { source: sourceId, target: valId });
      }
    });

    const graphData = {
      nodes: Array.from(nodesMap.values()),
      links: Array.from(linksMap.values())
    };

    // PERSIST POSITIONS FROM PREVIOUS SIMULATION
    if (simulationRef.current) {
      const oldNodes = simulationRef.current.nodes();
      graphData.nodes.forEach((newNode: any) => {
        const oldNode = oldNodes.find((n: any) => n.id === newNode.id);
        if (oldNode) {
          newNode.x = oldNode.x;
          newNode.y = oldNode.y;
          newNode.vx = oldNode.vx;
          newNode.vy = oldNode.vy;
        } else {
          // New nodes start near center to prevent "flying in"
          newNode.x = (svgRef.current?.clientWidth || 800) / 2;
          newNode.y = (svgRef.current?.clientHeight || 600) / 2;
        }
      });
    }

    // Defer initialization by one frame to ensure flex container has painted bounds
    const timeout = setTimeout(() => {
      if (!svgRef.current) return;

      const width = svgRef.current.clientWidth || 800;
      const height = svgRef.current.clientHeight || 600;

      const svg = d3.select(svgRef.current)
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`);

      svg.selectAll('*').remove();

      // STOP PREVIOUS SIMULATION
      if (simulationRef.current) {
        simulationRef.current.stop();
      }

      const simulation = d3.forceSimulation(graphData.nodes as any)
        .force('link', d3.forceLink(graphData.links).id((d: any) => d.id).distance(130))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('collide', d3.forceCollide().radius(50))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .velocityDecay(0.4) // Added friction to slow down movement
        .alphaTarget(0.008) // Extreme low-velocity organic movement
        .alphaMin(0.001);

      // Fix Core Hub at the center
      const hub = graphData.nodes.find((n: any) => n.id === 'Core_Hub');
      if (hub) {
        hub.fx = width / 2;
        hub.fy = height / 2;
      }

      simulationRef.current = simulation;

      const container = svg.append('g').attr('class', 'graph-container');

      // 1. Setup Zoom Behavior
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.2, 5])
        .interpolate(d3.interpolateZoom) // High-fidelity cinematic interpolation
        .on('zoom', (event) => {
          container.attr('transform', event.transform);
        });

      zoomRef.current = zoom;
      svg.call(zoom as any);
      svg.on('dblclick.zoom', null); // Disable double click zoom for tactical precision

      // 1. Setup SVG Filters
      const defs = svg.append('defs');
      const glow = defs.append('filter').attr('id', 'neon-glow');
      glow.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur');
      glow.append('feComposite').attr('in', 'SourceGraphic').attr('in2', 'blur').attr('operator', 'over');
      const linkGroup = container.append('g').attr('class', 'links');
      
      const link = linkGroup.selectAll('line')
        .data(graphData.links)
        .enter().append('line')
        .attr('stroke', 'rgba(0, 242, 255, 0.08)')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '5 3');

      // Animated Particles along HIGH SEVERITY links only (Performance Optimization)
      const particleLinks = graphData.links.filter((l: any) => 
        l.target.finding?.severity === 'CRITICAL' || l.target.finding?.severity === 'HIGH'
      );

      const particles = container.append('g').attr('class', 'particles')
        .selectAll('circle')
        .data(particleLinks)
        .enter().append('circle')
        .attr('r', 1.2)
        .attr('fill', (d: any) => d.target.finding?.severity === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-cyan)')
        .style('filter', 'url(#neon-glow)');

      const node = container.append('g')
        .selectAll('circle')
        .data(graphData.nodes)
        .enter().append('circle')
        .attr('r', (d: any) => d.type === 'target' ? 24 : 16)
        .attr('fill', (d: any) => {
          if (d.type === 'target') return '#8b5cf6';
          if (d.type === 'source') return '#06b6d4';
          return d.finding?.severity === 'CRITICAL' ? '#ef4444' : '#334155';
        })
        .attr('stroke', (d: any) => {
          if (d.type === 'target') return 'rgba(139, 92, 246, 0.5)';
          if (d.isNew) return 'var(--accent-cyan)'; // New node indicator
          return 'rgba(255,255,255,0.1)';
        })
        .attr('stroke-width', (d: any) => d.isNew ? 3 : 2)
        .style('cursor', 'pointer')
        .style('filter', (d: any) => d.type === 'target' || d.finding?.severity === 'CRITICAL' || d.isNew ? 'url(#neon-glow)' : 'none')
        .attr('class', (d: any) => d.isNew ? 'animate-pulse' : '') // Add pulse animation if new
        .on('click', (event, d) => setSelectedNode(d))
        .on('mouseover', function() {
          d3.select(this).transition().duration(200).attr('r', 22);
        })
        .on('mouseout', function(event, d: any) {
          d3.select(this).transition().duration(200).attr('r', d.type === 'target' ? 24 : 16);
        })
        .call(d3.drag<SVGCircleElement, unknown>()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended) as any);

      const labels = container.append('g')
        .selectAll('g')
        .data(graphData.nodes)
        .enter().append('g')
        .attr('style', 'pointer-events: none;');

      labels.append('text')
        .text((d: any) => d.label)
        .attr('font-size', '10px')
        .attr('fill', 'white')
        .attr('dx', 24)
        .attr('dy', 4)
        .style('font-family', 'JetBrains Mono')
        .style('letter-spacing', '1px')
        .style('text-shadow', '0 0 10px rgba(0,0,0,0.9)');

      simulation.on('tick', () => {
        link.attr('x1', (d: any) => d.source.x)
            .attr('y1', (d: any) => d.source.y)
            .attr('x2', (d: any) => d.target.x)
            .attr('y2', (d: any) => d.target.y);

        // Update particles position
        const t = (Date.now() % 2000) / 2000; // Animation cycle
        particles.attr('cx', (d: any) => d.source.x + (d.target.x - d.source.x) * t)
                 .attr('cy', (d: any) => d.source.y + (d.target.y - d.source.y) * t);

        node.attr('cx', (d: any) => d.x)
            .attr('cy', (d: any) => d.y);

        labels.attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);
      });

      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
    }, 100);

    return () => {
      clearTimeout(timeout);
      if (simulationRef.current) simulationRef.current.stop();
    };
  }, [findings]);

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-title-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Intelligence Workbench</h1>
          <p className="page-subtitle">Relational entity mapping and link analysis of live dark web findings.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="status-badge glow-cyan-hover" 
            style={{ 
              cursor: 'pointer', 
              background: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid var(--border-light)', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onClick={() => {
              if (zoomRef.current && svgRef.current) {
                const width = svgRef.current.clientWidth || 800;
                const height = svgRef.current.clientHeight || 600;
                d3.select(svgRef.current).transition().duration(750).ease(d3.easeCubicInOut).call(
                  (zoomRef.current as any).transform,
                  d3.zoomIdentity.translate(0, 0).scale(1)
                );
              }
            }}
          >
            <Layers size={14} /> RESET_VIEW
          </button>
          
          <button 
            className="status-badge glow-cyan-hover" 
            style={{ 
              cursor: 'pointer', 
              background: 'rgba(0, 242, 255, 0.1)', 
              border: '1px solid var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }} 
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onClick={fetchTopologyData}
          >
            <Network size={14} /> REFRESH TOPOLOGY
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
        
        {/* Main Graph Area */}
        <div style={{ flex: '3 1 600px', display: 'flex', flexDirection: 'column' }}>
          <div className="glass" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', minHeight: '600px' }}>
            <h3 className="data-mono" style={{ fontSize: '1rem', color: 'var(--accent-cyan)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={16} /> ENTITY_GRAPH_VIEW
            </h3>
            
            <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', border: '1px solid rgba(0, 242, 255, 0.15)', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
              {/* Grid Background Effect */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundSize: '40px 40px', backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)', pointerEvents: 'none' }}></div>
              <svg ref={svgRef} style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 10 }}></svg>
            </div>
          </div>
        </div>

        {/* Side Panel (Inspector) */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass" style={{ padding: '1.5rem' }}>
            <h3 className="data-mono" style={{ fontSize: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>NODE_INSPECTOR</h3>
            {selectedNode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span className="text-dim data-mono" style={{ fontSize: '0.75rem' }}>ENTITY_ID</span>
                  <span className="data-mono" style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', background: 'rgba(0, 242, 255, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>{selectedNode.id}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span className="text-dim data-mono" style={{ fontSize: '0.75rem' }}>TYPE_CLASS</span>
                  <span className="data-mono" style={{ fontSize: '0.85rem' }}>{selectedNode.type.toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span className="text-dim data-mono" style={{ fontSize: '0.75rem' }}>RAW_VALUE</span>
                  <span style={{ fontSize: '0.9rem', color: 'white' }}>{selectedNode.label}</span>
                </div>
                {selectedNode.finding && (
                  <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span className="text-dim data-mono" style={{ fontSize: '0.75rem' }}>THREAT_SEVERITY</span>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 800, 
                        background: selectedNode.finding.severity === 'CRITICAL' ? 'rgba(255, 68, 68, 0.1)' : 'rgba(0, 242, 255, 0.1)',
                        color: selectedNode.finding.severity === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-cyan)',
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }}>{selectedNode.finding.severity}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                       <span className="text-dim data-mono" style={{ fontSize: '0.75rem' }}>DATA_TYPE</span>
                       <span className="data-mono" style={{ fontSize: '0.85rem' }}>{selectedNode.finding.data_type}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-dim)', border: '1px dashed var(--border-light)', borderRadius: '8px', background: 'rgba(255,255,255,0.01)' }}>
                <Search size={32} style={{ marginBottom: '1rem', opacity: 0.3, margin: '0 auto' }} />
                <p style={{ fontSize: '0.85rem', maxWidth: '200px', margin: '0 auto' }}>Select a node in the topology to inspect properties.</p>
              </div>
            )}
          </div>

          <div className="glass" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', borderTop: '2px solid var(--accent-cyan)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="data-mono" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Terminal size={14} style={{ color: 'var(--accent-cyan)' }} /> ANALYSIS_LOG
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div className="status-dot animate-pulse" style={{ width: '5px', height: '5px', background: 'var(--accent-cyan)' }}></div>
                <span className="data-mono" style={{ fontSize: '0.5rem', opacity: 0.7 }}>LIVE_FEED</span>
              </div>
            </div>
            
            <div className="terminal-log-container" style={{ 
              flex: 1, 
              background: 'rgba(0,0,0,0.3)', 
              padding: '1rem', 
              borderRadius: '4px', 
              border: '1px solid rgba(255,255,255,0.05)',
              overflowY: 'auto',
              maxHeight: '320px'
            }}>
              <div className="data-mono" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.65rem' }}>
                {findings.length > 0 ? 
                  [...findings]
                    .sort((a, b) => new Date(b.discovered_at || 0).getTime() - new Date(a.discovered_at || 0).getTime())
                    .slice(0, 15)
                    .map((f: any, i: number) => (
                  <div key={i} className="animate-in" style={{ 
                    display: 'flex', 
                    gap: '0.75rem', 
                    paddingBottom: '0.4rem', 
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    alignItems: 'flex-start',
                    opacity: 1 - (i * 0.05) // Subtle fade for older logs in the rotation
                  }}>
                    <span style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{new Date(f.discovered_at || Date.now()).toLocaleTimeString([], { hour12: false })}</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ color: f.severity === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-cyan)', fontWeight: 800 }}>[{f.severity || 'INFO'}]</span>
                      <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>LINK_ESTABLISHED:</span>
                      <span style={{ color: 'white', marginLeft: '0.4rem', wordBreak: 'break-all' }}>{f.source} &raquo; {f.matched_value}</span>
                    </div>
                  </div>
                )) : (
                   <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>
                     <Activity className="animate-pulse" size={24} style={{ marginBottom: '0.5rem', color: 'var(--accent-cyan)' }} />
                     <div>[ WAITING_FOR_DATA_STREAM ]</div>
                   </div>
                )}
              </div>
            </div>
            <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
               <span className="data-mono" style={{ fontSize: '0.5rem', color: 'var(--text-dim)' }}>[ SHOWING_LATEST_15_ENTITIES // GRAPH_BUFFER_INTACT ]</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Investigation;
