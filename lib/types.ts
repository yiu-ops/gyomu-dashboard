export interface Timeline {
  date: string;
  action: string;
}

export interface TaskMeta {
  source_zip: string | null;
  folder_in_zip: string | null;
  filename: string;
  extension: string;
}

export type ParseStatus = "ok" | "skipped_empty" | "error_json" | "error_api";

export interface Task {
  category: string;
  task_name: string;
  description: string;
  precautions: string[];
  timeline: Timeline[];
  related_depts: string[];
  deliverables: string[];
  _parse_status: ParseStatus;
  _meta: TaskMeta;
}
