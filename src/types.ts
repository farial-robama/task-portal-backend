export type Priority = "Low" | "Medium" | "High";
export type Status = "Pending" | "In Progress" | "Completed";

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  created_at: string;
  updated_at: string;
}

// Row shape as returned by better-sqlite3 (snake_case matches the DB columns,
// so no mapping is needed between the two).
export type TaskRow = Task;
