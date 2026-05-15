/**
 * Socket.io Connection Hook
 * Manages the real-time WebSocket connection for live threat updates.
 */

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useFindingsStore } from '../store/findingsStore';

export const useSocket = () => {
  const { isConnected, addFinding, addAlert, setIsConnected, updateStats, setGlobalIntel, addNetworkLog, setWatchlist, clearFindings, updatePerformance } = useFindingsStore();

  useEffect(() => {
    // TACTICAL_CONNECTION_LOGIC: 
    // In dev, Vite proxy handles /socket.io correctly.
    // In production/deployment, we use the same origin to avoid cross-port/CORS failures.
    const isDev = import.meta.env.DEV;
    const socketUrl = isDev ? '/' : (import.meta.env.VITE_API_URL || window.location.origin);
    
    const s = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'], // Allow fallback for restricted network environments
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });
    
    s.on('connect', () => {
      console.log('[SOCKET] Connected');
      setIsConnected(true);
    });

    s.on('disconnect', () => {
      console.log('[SOCKET] Disconnected');
      setIsConnected(false);
    });

    s.on('connect_error', (err) => {
      console.error('[SOCKET] Connection failed. Retrying...', err.message);
      setIsConnected(false);
    });
    
    (window as any).io_client = s;

    s.on('new_finding', (finding) => {
      if (finding && finding.id) {
        addFinding(finding);
      } else {
        console.warn('[SOCKET] Received invalid finding payload:', finding);
      }
    });

    s.on('new_alert', (alert) => {
      if (alert && alert.id) {
        addAlert(alert);
      }
    });

    s.on('stats_update', (stats) => {
      useFindingsStore.getState().updateStats(stats);
    });

    s.on('world_grid_update', (data) => {
      const currentIntel = useFindingsStore.getState().globalIntel;
      // Fluctuating Traffic Simulation for High-Fidelity UX
      const baseTraffic = parseFloat(currentIntel.totalTraffic || '14.82');
      const fluctuation = (Math.random() - 0.5) * 0.5;
      const newTraffic = (baseTraffic + fluctuation).toFixed(2);
      
      const updatedIntel = {
        ...(data.intel || currentIntel),
        totalTraffic: `${newTraffic} TB / SEC`,
        activeIntrusions: Math.max(1, Math.min(15, (currentIntel.activeIntrusions || 3) + (Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0)))
      };

      if (data.intel || updatedIntel) useFindingsStore.getState().setGlobalIntel(updatedIntel);
      if (data.log) useFindingsStore.getState().addNetworkLog(data.log);
    });

    s.on('findings_cleared', () => {
      useFindingsStore.getState().clearFindings();
    });

    s.on('system_performance', (perf) => {
      useFindingsStore.getState().updatePerformance(perf);
    });

    s.on('watchlist_update', (items) => {
      useFindingsStore.getState().setWatchlist(items);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  return isConnected;
};
