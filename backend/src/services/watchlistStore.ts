import { prisma } from '../lib/prisma';
import { LocalVault } from '../utils/localVault';

const VAULT_FILE = 'watchlist.json';

class WatchlistStore {
  async getAll() {
    try {
      return await prisma.watchlistItem.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } catch (err) {
      console.warn('[WATCHLIST] DB offline, using local vault');
      return await LocalVault.read(VAULT_FILE);
    }
  }

  async getActive() {
    try {
      return await prisma.watchlistItem.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      });
    } catch (err) {
      const local = await LocalVault.read(VAULT_FILE);
      return local.filter((i: any) => i.isActive || i.status === 'Active');
    }
  }

  async add(item: any) {
    const newItem = {
      id: `W-${Math.random().toString(36).substr(2, 8)}`,
      ...item,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    try {
      await prisma.watchlistItem.create({
        data: {
          type: item.type,
          value: item.value,
          label: item.label,
          priority: item.priority || 'LOW',
          isActive: true
        }
      });
    } catch (err: unknown) {
      console.error('[WATCHLIST] DB update failed:', (err as Error).message);
    }

    const local = await LocalVault.read(VAULT_FILE);
    await LocalVault.write(VAULT_FILE, [newItem, ...local]);
    return newItem;
  }

  async delete(id: string) {
    try {
      await prisma.watchlistItem.delete({ where: { id } });
    } catch (e) {}
    
    const local = await LocalVault.read(VAULT_FILE);
    await LocalVault.write(VAULT_FILE, local.filter((i: any) => i.id !== id));
    return true;
  }

  async toggleStatus(id: string) {
    let updatedItem = null;
    try {
      const item = await prisma.watchlistItem.findUnique({ where: { id } });
      if (item) {
        updatedItem = await prisma.watchlistItem.update({
          where: { id },
          data: { isActive: !item.isActive }
        });
      }
    } catch (e) {}

    const local = await LocalVault.read(VAULT_FILE);
    const newLocal = local.map((i: any) => {
      if (i.id === id) {
        const updated = { ...i, isActive: !i.isActive };
        updatedItem = updated;
        return updated;
      }
      return i;
    });
    await LocalVault.write(VAULT_FILE, newLocal);
    
    return updatedItem;
  }
}

export const watchlistStore = new WatchlistStore();

