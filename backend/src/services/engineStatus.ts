export interface EngineStatus {
  isRunning: boolean;
  autoScanEnabled: boolean;
  lastScanAt?: string;
}

let status: EngineStatus = {
  isRunning: false,
  autoScanEnabled: true
};

export const engineStatus = {
  get: () => status,
  update: (newStatus: Partial<EngineStatus>) => {
    status = { ...status, ...newStatus };
  }
};
