import { Request, Response } from "express";
import { db } from "../db/connection";
import { ApiError, asyncHandler } from "../middleware/errorHandler";
import {
  createTaskSchema,
  updateStatusSchema,
  updateTaskSchema,
} from "../validators/taskValidator";
import { Task } from "../types";

function findTaskById(id: number): Task | undefined {
  return db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as
    | Task
    | undefined;
}

// GET /api/tasks?status=&priority=&search=
export const listTasks = asyncHandler(async (req: Request, res: Response) => {
  const { status, priority, search } = req.query;

  const clauses: string[] = [];
  const params: Record<string, string> = {};

  if (typeof status === "string" && status.length > 0) {
    clauses.push("status = @status");
    params.status = status;
  }
  if (typeof priority === "string" && priority.length > 0) {
    clauses.push("priority = @priority");
    params.priority = priority;
  }
  if (typeof search === "string" && search.length > 0) {
    clauses.push("(title LIKE @search OR description LIKE @search)");
    params.search = `%${search}%`;
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const tasks = db
    .prepare(`SELECT * FROM tasks ${where} ORDER BY created_at DESC`)
    .all(params) as Task[];

  res.json({ data: tasks });
});

// GET /api/tasks/:id
export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const task = findTaskById(id);
  if (!task) throw new ApiError(404, `Task ${id} was not found`);
  res.json({ data: task });
});

// POST /api/tasks
export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const input = createTaskSchema.parse(req.body);

  const result = db
    .prepare(
      `INSERT INTO tasks (title, description, priority, status)
       VALUES (@title, @description, @priority, @status)`
    )
    .run(input);

  const task = findTaskById(Number(result.lastInsertRowid));
  res.status(201).json({ data: task });
});

// PUT /api/tasks/:id  
export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const existing = findTaskById(id);
  if (!existing) throw new ApiError(404, `Task ${id} was not found`);

  const input = updateTaskSchema.parse(req.body);
  const merged = { ...existing, ...input };

  db.prepare(
    `UPDATE tasks
     SET title = @title,
         description = @description,
         priority = @priority,
         status = @status,
         updated_at = datetime('now')
     WHERE id = @id`
  ).run({ ...merged, id });

  res.json({ data: findTaskById(id) });
});

// PATCH /api/tasks/:id/status  
export const updateTaskStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const existing = findTaskById(id);
    if (!existing) throw new ApiError(404, `Task ${id} was not found`);

    const { status } = updateStatusSchema.parse(req.body);

    db.prepare(
      `UPDATE tasks SET status = @status, updated_at = datetime('now') WHERE id = @id`
    ).run({ status, id });

    res.json({ data: findTaskById(id) });
  }
);

// DELETE /api/tasks/:id
export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const existing = findTaskById(id);
  if (!existing) throw new ApiError(404, `Task ${id} was not found`);

  db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  res.status(204).send();
});
