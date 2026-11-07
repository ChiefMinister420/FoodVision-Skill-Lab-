import fs from 'fs';
import path from 'path';

export interface DatabaseRecord {
  id: string;
  dishName: string;
  cuisine: string;
  timestamp: string;
  crispiness: number;
  umami: number;
  bakedOrFried: number;
  vegetarian: number;
  proteinDensity: number;
  topAttribute: string;
  confidenceThreshold?: number;
  createdAt: string;
}

export interface StoredDish {
  id: string;
  name: string;
  cuisine: string;
  imageUrl: string;
  description: string;
  createdAt: string;
}

export interface FoodVisionDatabaseSchema {
  version: string;
  records: DatabaseRecord[];
  customDishes: StoredDish[];
  metadata: {
    lastUpdated: string;
    totalClassificationsCount: number;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'foodvision_db.json');

// Initial seed records
const INITIAL_RECORDS: DatabaseRecord[] = [
  {
    id: 'seed-rec-1',
    timestamp: '10:14',
    dishName: 'Tempura Donburi',
    cuisine: 'Japanese',
    crispiness: 95,
    umami: 92,
    bakedOrFried: 96,
    vegetarian: 22,
    proteinDensity: 82,
    topAttribute: 'Crispy & Crunchy Crust',
    confidenceThreshold: 0.50,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'seed-rec-2',
    timestamp: '10:18',
    dishName: 'Pizza Margherita',
    cuisine: 'Italian',
    crispiness: 78,
    umami: 88,
    bakedOrFried: 98,
    vegetarian: 99,
    proteinDensity: 65,
    topAttribute: 'Chewy & Airy Dough',
    confidenceThreshold: 0.50,
    createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
  },
  {
    id: 'seed-rec-3',
    timestamp: '10:22',
    dishName: 'Kung Pao Chicken',
    cuisine: 'Sichuan Chinese',
    crispiness: 85,
    umami: 96,
    bakedOrFried: 94,
    vegetarian: 2,
    proteinDensity: 92,
    topAttribute: 'Wok-Fried & Spicy Glaze',
    confidenceThreshold: 0.50,
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'seed-rec-4',
    timestamp: '10:27',
    dishName: 'Greek Salad',
    cuisine: 'Mediterranean',
    crispiness: 92,
    umami: 62,
    bakedOrFried: 1,
    vegetarian: 99,
    proteinDensity: 45,
    topAttribute: 'Crisp & Raw Garden Produce',
    confidenceThreshold: 0.50,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'seed-rec-5',
    timestamp: '10:31',
    dishName: 'French Croissant',
    cuisine: 'French Patisserie',
    crispiness: 98,
    umami: 45,
    bakedOrFried: 99,
    vegetarian: 98,
    proteinDensity: 45,
    topAttribute: 'Flaky & Laminated Micro-Layers',
    confidenceThreshold: 0.50,
    createdAt: new Date(Date.now() - 900000).toISOString(),
  },
];

class FoodVisionDatabase {
  private inMemoryData: FoodVisionDatabaseSchema;

  constructor() {
    this.inMemoryData = this.loadFromDisk();
  }

  private loadFromDisk(): FoodVisionDatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.records)) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to read database file from disk, initializing fresh:', err);
    }

    const defaultSchema: FoodVisionDatabaseSchema = {
      version: '1.0.0',
      records: [...INITIAL_RECORDS],
      customDishes: [],
      metadata: {
        lastUpdated: new Date().toISOString(),
        totalClassificationsCount: INITIAL_RECORDS.length,
      },
    };

    this.saveToDisk(defaultSchema);
    return defaultSchema;
  }

  private saveToDisk(data: FoodVisionDatabaseSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing database to disk:', err);
    }
  }

  public getHistory(): DatabaseRecord[] {
    return this.inMemoryData.records;
  }

  public addHistoryRecord(record: Omit<DatabaseRecord, 'id' | 'createdAt'>): DatabaseRecord {
    const newRecord: DatabaseRecord = {
      ...record,
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };

    this.inMemoryData.records.push(newRecord);
    this.inMemoryData.metadata.lastUpdated = new Date().toISOString();
    this.inMemoryData.metadata.totalClassificationsCount += 1;
    this.saveToDisk(this.inMemoryData);

    return newRecord;
  }

  public clearHistory(): void {
    this.inMemoryData.records = [];
    this.inMemoryData.metadata.lastUpdated = new Date().toISOString();
    this.saveToDisk(this.inMemoryData);
  }

  public addCustomDish(dish: Omit<StoredDish, 'id' | 'createdAt'>): StoredDish {
    const newDish: StoredDish = {
      ...dish,
      id: `dish-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };

    this.inMemoryData.customDishes.push(newDish);
    this.inMemoryData.metadata.lastUpdated = new Date().toISOString();
    this.saveToDisk(this.inMemoryData);

    return newDish;
  }

  public getCustomDishes(): StoredDish[] {
    return this.inMemoryData.customDishes;
  }

  public getStats() {
    const recs = this.inMemoryData.records;
    const total = recs.length;
    const avgCrisp = total > 0 ? Math.round(recs.reduce((a, b) => a + b.crispiness, 0) / total) : 0;
    const avgUmami = total > 0 ? Math.round(recs.reduce((a, b) => a + b.umami, 0) / total) : 0;
    const avgCook = total > 0 ? Math.round(recs.reduce((a, b) => a + b.bakedOrFried, 0) / total) : 0;

    let fileSize = 0;
    try {
      if (fs.existsSync(DB_FILE)) {
        fileSize = fs.statSync(DB_FILE).size;
      }
    } catch {}

    return {
      status: 'connected',
      engine: 'File-Backed JSON Database Engine',
      totalRecords: total,
      totalCustomDishes: this.inMemoryData.customDishes.length,
      averageCrispiness: avgCrisp,
      averageUmami: avgUmami,
      averageCooked: avgCook,
      databaseSizeBytes: fileSize,
      lastUpdated: this.inMemoryData.metadata.lastUpdated,
      storagePath: DB_FILE,
    };
  }
}

export const db = new FoodVisionDatabase();
