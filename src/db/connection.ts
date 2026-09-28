import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dbFile = process.env.DATABASE_FILE || "./data/tasks.db";
const resolvedPath = path.resolve(process.cwd(), dbFile);

fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });

export const db = new Database(resolvedPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
