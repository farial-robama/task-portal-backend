import "dotenv/config";
import cors from "cors";
import express from "express";
import { runMigrations } from "./db/migrate";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { taskRouter } from "./routes/tasks";
import { seedDemoData } from "./db/seed";

runMigrations();
if (process.env.SEED_DEMO_DATA === "true") seedDemoData();

const app = express();
const port = Number(process.env.PORT) || 4000;
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/tasks", taskRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Task Portal API listening on port ${port}`);
});
