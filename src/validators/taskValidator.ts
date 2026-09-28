import { z } from "zod";

export const PRIORITIES = ["Low", "Medium", "High"] as const;
export const STATUSES = ["Pending", "In Progress", "Completed"] as const;

export const createTaskSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(1, "Title is required")
    .max(120, "Title must be 120 characters or fewer"),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be 2000 characters or fewer")
    .optional()
    .default(""),
  priority: z.enum(PRIORITIES, {
    errorMap: () => ({ message: "Priority must be Low, Medium, or High" }),
  }),
  status: z
    .enum(STATUSES, {
      errorMap: () => ({
        message: "Status must be Pending, In Progress, or Completed",
      }),
    })
    .optional()
    .default("Pending"),
});

export const updateTaskSchema = createTaskSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

export const updateStatusSchema = z.object({
  status: z.enum(STATUSES, {
    errorMap: () => ({
      message: "Status must be Pending, In Progress, or Completed",
    }),
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
