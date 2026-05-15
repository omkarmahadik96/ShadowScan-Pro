import { prisma } from '../lib/prisma';

class AdversariesStore {
  async add(adversary: any) {
    return await prisma.adversary.create({
      data: {
        name: adversary.name,
        aliases: adversary.aliases || [],
        origin: adversary.origin,
        active: adversary.active,
        motivation: adversary.motivation,
        targets: adversary.targets || [],
        severity: adversary.severity,
        status: adversary.status,
        lastSeen: adversary.last_seen ? new Date(adversary.last_seen) : new Date()
      }
    });
  }

  async updateStatus(id: string, status: string) {
    return await prisma.adversary.update({
      where: { id },
      data: { 
        status,
        lastSeen: new Date()
      }
    });
  }

  async getAll() {
    return await prisma.adversary.findMany({
      orderBy: { lastSeen: 'desc' }
    });
  }
}

export const adversariesStore = new AdversariesStore();

