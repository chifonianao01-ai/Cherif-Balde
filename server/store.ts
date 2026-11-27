import fs from 'node:fs/promises';
import path from 'node:path';
import { DEFAULT_PORTFOLIO_DATA } from './defaultData.ts';
import type { PortfolioData, StoredDatabase } from './types.ts';

const ROOT_DIR = process.cwd();
const DATA_DIR = path.resolve(ROOT_DIR, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'portfolio-db.json');
export const UPLOADS_DIR = path.resolve(ROOT_DIR, 'uploads');

let writeQueue: Promise<void> = Promise.resolve();

async function ensureDirectories(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

function createInitialDb(): StoredDatabase {
  return {
    portfolio: structuredClone(DEFAULT_PORTFOLIO_DATA),
    messages: [],
    adminPasswordHash: null,
  };
}

export async function readDatabase(): Promise<StoredDatabase> {
  await ensureDirectories();
  try {
    const raw = await fs.readFile(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<StoredDatabase>;
    return {
      portfolio: parsed.portfolio ? mergeWithDefaults(parsed.portfolio) : structuredClone(DEFAULT_PORTFOLIO_DATA),
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      adminPasswordHash: typeof parsed.adminPasswordHash === 'string' ? parsed.adminPasswordHash : null,
    };
  } catch {
    const initial = createInitialDb();
    await writeDatabase(initial);
    return initial;
  }
}

function mergeWithDefaults(portfolio: Partial<PortfolioData>): PortfolioData {
  return {
    profile: {
      ...DEFAULT_PORTFOLIO_DATA.profile,
      ...(portfolio.profile || {}),
      social: {
        ...DEFAULT_PORTFOLIO_DATA.profile.social,
        ...(portfolio.profile?.social || {}),
      },
    },
    education: Array.isArray(portfolio.education) ? portfolio.education : DEFAULT_PORTFOLIO_DATA.education,
    skills: Array.isArray(portfolio.skills) ? portfolio.skills : DEFAULT_PORTFOLIO_DATA.skills,
    projects: Array.isArray(portfolio.projects) ? portfolio.projects : DEFAULT_PORTFOLIO_DATA.projects,
    experiences: Array.isArray(portfolio.experiences) ? portfolio.experiences : DEFAULT_PORTFOLIO_DATA.experiences,
    languages: Array.isArray(portfolio.languages) ? portfolio.languages : DEFAULT_PORTFOLIO_DATA.languages,
    objectives: portfolio.objectives
      ? { ...DEFAULT_PORTFOLIO_DATA.objectives, ...portfolio.objectives }
      : DEFAULT_PORTFOLIO_DATA.objectives,
    interests: Array.isArray(portfolio.interests) ? portfolio.interests : DEFAULT_PORTFOLIO_DATA.interests,
    gallery: Array.isArray(portfolio.gallery) ? portfolio.gallery : DEFAULT_PORTFOLIO_DATA.gallery,
  };
}

export async function writeDatabase(db: StoredDatabase): Promise<void> {
  await ensureDirectories();
  const nextWrite = writeQueue.then(async () => {
    const tmpFile = `${DB_FILE}.${process.pid}.tmp`;
    await fs.writeFile(tmpFile, JSON.stringify(db, null, 2), 'utf-8');
    await fs.rename(tmpFile, DB_FILE);
  });
  writeQueue = nextWrite.catch(() => undefined);
  return nextWrite;
}

export async function mutateDatabase<T>(updater: (db: StoredDatabase) => T | Promise<T>): Promise<T> {
  const db = await readDatabase();
  const result = await updater(db);
  await writeDatabase(db);
  return result;
}
