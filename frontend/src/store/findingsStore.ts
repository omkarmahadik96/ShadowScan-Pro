/**
 * Findings State Store
 * Manages the real-time feed of findings and alerts using Zustand.
 */

import { create } from 'zustand';

interface FindingsState {
  findings: any[];
  alerts: any[];
  searchTerm: string;
  isConsoleOpen: boolean;
  networkLogs: string[];
  isConnected: boolean;
  globalIntel: {
    torNodes: number;
    threatLevel: string;
    activeBreaches: number;
    totalTraffic: string;
    activeIntrusions: number;
    lastSync: string;
  };
  stats: {
    totalTargets?: number;
    totalFindings?: number;
    criticalThreats?: number;
    sourcesOnline?: number;
    surveillanceReach?: number;
    growth?: number;
    findingsGrowth?: number;
    threatLevel?: string;
    torNodes?: number;
    lastUpdate?: string;
    severityDistribution?: any[];
    trend?: any[];
    summary?: any;
    globalFeed?: any[];
    signals?: any[];
    scheduler?: {
      isRunning: boolean;
      autoScanEnabled: boolean;
      lastScanAt?: string;
    };
    totalAlerts?: number;
  };
  performance: {
    cpuUsage: number;
    memUsage: number;
    uptime: number;
    status: string;
    kernel: string;
    platform: string;
    timestamp: string;
  } | null;
  user: {
    name: string;
    role: string;
    clearance: string;
    avatar: string;
    profilePic?: string;
  };
  watchlist: any[];
  setSearchTerm: (term: string) => void;
  toggleConsole: () => void;
  setFindings: (findings: any[]) => void;
  setAlerts: (alerts: any[]) => void;
  setWatchlist: (items: any[]) => void;
  addFinding: (finding: any) => void;
  addAlert: (alert: any) => void;
  acknowledgeAlert: (id: string) => void;
  updateStats: (stats: any) => void;
  addNetworkLog: (log: string) => void;
  setGlobalIntel: (intel: any) => void;
  setIsConnected: (connected: boolean) => void;
  updatePerformance: (perf: any) => void;
  updateUser: (userData: any) => void;
  clearFindings: () => void;
  resetSystem: () => void;
}

export const useFindingsStore = create<FindingsState>((set) => ({
  findings: [],
  alerts: [],
  networkLogs: [],
  watchlist: [],
  isConnected: false,
  globalIntel: {
    torNodes: 6500,
    threatLevel: 'STABLE',
    activeBreaches: 124,
    totalTraffic: '14.82 TB / SEC',
    activeIntrusions: 3,
    lastSync: new Date().toISOString()
  },
  stats: JSON.parse(localStorage.getItem('shadowscan_stats') || JSON.stringify({
    totalTargets: 0,
    totalFindings: 0,
    criticalThreats: 0,
    sourcesOnline: 45,
    surveillanceReach: 84.2,
    growth: 0,
    findingsGrowth: 0,
    threatLevel: 'STABLE',
    torNodes: 0,
    lastUpdate: new Date().toISOString(),
    globalFeed: [],
    signals: [],
    scheduler: { isRunning: false, autoScanEnabled: true }
  })),
  user: JSON.parse(localStorage.getItem('shadowscan_user') || '{"name": "ADMIN_ROOT", "role": "System Architect", "clearance": "LEVEL_5", "avatar": "AD"}'),
  searchTerm: '',
  performance: null,
  isConsoleOpen: false,
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  toggleConsole: () => set((state) => ({ isConsoleOpen: !state.isConsoleOpen })),

  setFindings: (findings) => set({ findings: findings || [] }),
  setAlerts: (alerts) => set({ alerts: alerts || [] }),
  setWatchlist: (watchlist) => set({ watchlist: watchlist || [] }),
  addFinding: (finding) => set((state) => {
    const currentFindings = state.findings || [];
    const currentStats = state.stats || {};
    const newStats = { 
      ...currentStats, 
      totalFindings: (currentStats.totalFindings || 0) + 1,
      criticalThreats: finding.severity === 'CRITICAL' ? (currentStats.criticalThreats || 0) + 1 : (currentStats.criticalThreats || 0)
    };
    localStorage.setItem('shadowscan_stats', JSON.stringify(newStats));
    return {
      findings: [finding, ...currentFindings].slice(0, 100),
      stats: newStats
    };
  }),

  addAlert: (alert) => set((state) => {
    const currentStats = state.stats || {};
    const newStats = {
      ...currentStats,
      criticalThreats: alert.severity === 'CRITICAL' ? (currentStats.criticalThreats || 0) + 1 : (currentStats.criticalThreats || 0)
    };
    localStorage.setItem('shadowscan_stats', JSON.stringify(newStats));
    return {
      alerts: [alert, ...(state.alerts || [])].slice(0, 100),
      stats: newStats
    };
  }),

  acknowledgeAlert: (id) => set((state) => ({
    alerts: (state.alerts || []).filter(a => a && a.id !== id)
  })),

  updateStats: (stats) => set((state) => {
    const newStats = { ...(state.stats || {}), ...(stats || {}) };
    localStorage.setItem('shadowscan_stats', JSON.stringify(newStats));
    return { stats: newStats };
  }),
  addNetworkLog: (log) => set((state) => ({
    networkLogs: [log, ...state.networkLogs].slice(0, 10)
  })),
  setGlobalIntel: (intel) => set({ globalIntel: intel }),
  setIsConnected: (connected) => set({ isConnected: connected }),
  updatePerformance: (performance) => set({ performance }),
  updateUser: (userData) => set((state) => {
    const newUser = { ...(state.user || {}), ...userData };
    localStorage.setItem('shadowscan_user', JSON.stringify(newUser));
    return { user: newUser };
  }),
  clearFindings: () => set({ 
    findings: [], 
    alerts: [], 
    stats: { 
      totalTargets: 0, 
      totalFindings: 0, 
      criticalThreats: 0, 
      sourcesOnline: 45, 
      surveillanceReach: 84.2, 
      growth: 0, 
      findingsGrowth: 0, 
      threatLevel: 'STABLE', 
      torNodes: 0, 
      lastUpdate: new Date().toISOString(),
      globalFeed: [],
      signals: [],
      scheduler: { isRunning: false, autoScanEnabled: true }
    } 
  }),
  resetSystem: () => {
    localStorage.removeItem('shadowscan_user');
    localStorage.removeItem('shadowscan_stats');
    window.location.reload();
  },
}));
