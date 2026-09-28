import { db } from "./connection";

const DEMO_TASKS = [
  ["Design the login screen", "Sketch wireframes and agree on the layout with the team.", "High", "Completed"],
  ["Set up CI pipeline", "Run lint and tests on every pull request.", "High", "In Progress"],
  ["Write API documentation", "Document each endpoint with request and response examples.", "Medium", "In Progress"],
  ["Plan sprint retrospective", "Collect feedback and prepare talking points.", "Low", "Pending"],
  ["Fix mobile layout bug", "The task cards overflow on very small screens.", "Medium", "Pending"],
] as const;


export function seedDemoData(): void {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM tasks").get() as {
    count: number;
  };
  if (count > 0) return;

  const insert = db.prepare(
    "INSERT INTO tasks (title, description, priority, status) VALUES (?, ?, ?, ?)"
  );
  const insertAll = db.transaction(() => {
    for (const task of DEMO_TASKS) insert.run(...task);
  });
  insertAll();
  console.log(`[seed] inserted ${DEMO_TASKS.length} demo tasks`);
}