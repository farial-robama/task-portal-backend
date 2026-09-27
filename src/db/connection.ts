import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dbFile = process.env.DATABASE_FILE || "./data/tasks.db";
const resolvedPath = path.resolve(process.cwd(), dbFile);

// Make sure the directory for the database file exists before opening it.
fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });

export const db = new Database(resolvedPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
