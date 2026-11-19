import { config } from '../config/env.js';
import { openDatabase } from './db.js';
import { createRepositories } from './repositories.js';

export const db = openDatabase(config.dbPath);
export const repos = createRepositories(db);
