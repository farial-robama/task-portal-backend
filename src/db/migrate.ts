import fs from "fs";
import path from "path";
import { db } from "./connection";

/**
 * Runs every .sql file in /migrations, in filename order, inside a single
 * transaction. Statements use `CREATE TABLE IF NOT EXISTS`, so this is safe
 * to call on every server start.
 */
export function runMigrations(): void {
  const migrationsDir = path.resolve(process.cwd(), "migrations");
  if (!fs.existsSync(migrationsDir)) return;

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const applyAll = db.transaction(() => {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
      db.exec(sql);
      console.log(`[migrate] applied ${file}`);
    }
  });

  applyAll();
}

if (require.main === module) {
  runMigrations();
  console.log("[migrate] done");
}
