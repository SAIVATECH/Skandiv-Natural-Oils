import { prisma } from './prisma';

export interface SimulatedMsg {
  id: string;
  sender: 'CUSTOMER' | 'SYSTEM' | 'ERROR';
  phone: string;
  text: string;
  timestamp: string;
}

// Fallback in-memory logs for offline development if DB is not ready
const inMemoryLogs: SimulatedMsg[] = [];

/**
 * Persists message logs to Supabase DB (shared sync) or in-memory fallback
 */
export async function addSimulatorLog(sender: 'CUSTOMER' | 'SYSTEM' | 'ERROR', phone: string, text: string) {
  const cleanPhone = phone.replace(/^whatsapp:/i, '').replace(/\D/g, '');
  const id = `msg_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
  const timestamp = new Date().toISOString();

  try {
    await (prisma as any).messageLog.create({
      data: {
        id,
        sender,
        phone: cleanPhone,
        text,
      },
    });
    console.log(`[Simulator DB Log] Persisted ${sender} message for +${cleanPhone} inside Supabase`);
  } catch (error) {
    console.warn('[Simulator DB Log Warning] Failed to write to Supabase, falling back to local in-memory:', error);
    inMemoryLogs.push({
      id,
      sender,
      phone: cleanPhone,
      text,
      timestamp,
    });
    if (inMemoryLogs.length > 100) {
      inMemoryLogs.shift();
    }
  }
}

/**
 * Retrieves the latest 100 logs from Supabase DB or in-memory fallback
 */
export async function getSimulatorLogs(phoneFilter?: string): Promise<SimulatedMsg[]> {
  try {
    const whereClause: any = {};
    if (phoneFilter) {
      whereClause.phone = phoneFilter.replace(/^whatsapp:/i, '').replace(/\D/g, '');
    }

    const dbLogs = await (prisma as any).messageLog.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    return dbLogs.map((log: any) => ({
      id: log.id,
      sender: log.sender as any,
      phone: log.phone,
      text: log.text,
      timestamp: log.timestamp.toISOString(),
    })).reverse(); // Chronological order for simulator chat screen
  } catch (error) {
    // Fallback in-memory filter
    if (phoneFilter) {
      const cleanPhone = phoneFilter.replace(/^whatsapp:/i, '').replace(/\D/g, '');
      return inMemoryLogs.filter(log => log.phone === cleanPhone);
    }
    return inMemoryLogs;
  }
}

