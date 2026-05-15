import { prisma } from '../lib/prisma';

class CountermeasuresStore {
  async add(log: any) {
    return await prisma.countermeasureLog.create({
      data: {
        actorId: log.actorId,
        actorName: log.actorName,
        logs: log.logs,
        status: log.status,
        timestamp: log.timestamp ? new Date(log.timestamp) : new Date()
      }
    });
  }

  async getAll() {
    return await prisma.countermeasureLog.findMany({
      orderBy: { timestamp: 'desc' }
    });
  }

  async getByActor(actorId: string) {
    return await prisma.countermeasureLog.findMany({
      where: { actorId },
      orderBy: { timestamp: 'desc' }
    });
  }
}

export const countermeasuresStore = new CountermeasuresStore();

