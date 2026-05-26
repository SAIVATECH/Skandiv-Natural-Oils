export interface SimulatedMsg {
  id: string;
  sender: 'CUSTOMER' | 'SYSTEM' | 'ERROR';
  phone: string;
  text: string;
  timestamp: string;
}

// Store logs in a global array to persist across hot reloads in Next.js development
const globalForSimulator = global as unknown as {
  simulatedLogs: SimulatedMsg[];
};

if (!globalForSimulator.simulatedLogs) {
  globalForSimulator.simulatedLogs = [];
}

export const simulatorLogs = globalForSimulator.simulatedLogs;

export function addSimulatorLog(sender: 'CUSTOMER' | 'SYSTEM' | 'ERROR', phone: string, text: string) {
  simulatorLogs.push({
    id: Math.random().toString(36).substring(2, 11),
    sender,
    phone,
    text,
    timestamp: new Date().toISOString(),
  });
  
  // Keep last 100 logs
  if (simulatorLogs.length > 100) {
    simulatorLogs.shift();
  }
}
