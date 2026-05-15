import fs from 'fs';
import path from 'path';

interface Operator {
  id: string;
  name: string;
  role: string;
  status: string;
  joinedAt: string;
}

const STORAGE_PATH = path.join(process.cwd(), 'data', 'operators.json');

class UsersStore {
  private operators: Operator[] = [
    { id: 'OP-01', name: 'ADMIN_ROOT', role: 'SuperUser', status: 'Online', joinedAt: new Date().toISOString() },
    { id: 'OP-02', name: 'ANALYST_01', role: 'Forensics', status: 'Online', joinedAt: new Date().toISOString() },
    { id: 'OP-03', name: 'SURVEILLANCE_BOT', role: 'Automated', status: 'Online', joinedAt: new Date().toISOString() }
  ];

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(STORAGE_PATH)) {
        const data = fs.readFileSync(STORAGE_PATH, 'utf8');
        this.operators = JSON.parse(data);
      } else {
        const dir = path.dirname(STORAGE_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        this.save();
      }
    } catch (err) {
      console.error('Failed to load operators:', err);
    }
  }

  private save() {
    try {
      fs.writeFileSync(STORAGE_PATH, JSON.stringify(this.operators, null, 2));
    } catch (err) {
      console.error('Failed to save operators:', err);
    }
  }

  getAll() {
    return this.operators;
  }

  add(name: string, role: string = 'Analyst') {
    const newOp: Operator = {
      id: `OP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      name: name.toUpperCase(),
      role,
      status: 'Online',
      joinedAt: new Date().toISOString()
    };
    this.operators.push(newOp);
    this.save();
    return newOp;
  }

  remove(id: string) {
    this.operators = this.operators.filter(op => op.id !== id);
    this.save();
    return true;
  }
}

export const usersStore = new UsersStore();
