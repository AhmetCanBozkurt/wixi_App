// M14 Proje & Görev Yönetimi — tip tanımları

export type ProjectStatus = 0 | 1 | 2 | 3; // Active | OnHold | Completed | Cancelled
export type TaskStatus = 0 | 1 | 2 | 3;    // Todo | InProgress | Review | Done
export type TaskPriority = 0 | 1 | 2 | 3;  // Low | Medium | High | Urgent

export interface TaskAssigneeDto {
  userId: string;
  userName?: string;
  userEmail?: string;
}

export interface ProjectListDto extends Record<string, unknown> {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  customerId?: string;
  cariId?: string;
  customerName?: string;
  startDate: string;
  endDate?: string;
  budget?: number;
  currency?: string;
  color?: string;
  taskCount: number;
  doneTaskCount: number;
  createdAt: string;
}

export interface TaskBoardDto {
  id: string;
  projectId: string;
  parentTaskId?: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  startDate?: string;
  dueDate?: string;
  durationDays?: number;
  sortOrder: number;
  completedAt?: string;
  assignees: TaskAssigneeDto[];
  subTaskCount: number;
  commentCount: number;
}

export interface ProjectBoardDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  customerId?: string;
  customerName?: string;
  startDate: string;
  endDate?: string;
  color?: string;
  tasks: TaskBoardDto[];
}

export interface TaskCommentDto {
  id: string;
  taskId: string;
  authorUserId?: string;
  authorName?: string;
  content: string;
  isSystemLog: boolean;
  createdAt: string;
}

export interface TimeEntryDto {
  id: string;
  taskId: string;
  userId: string;
  userName?: string;
  startedAt: string;
  endedAt?: string;
  durationMinutes: number;
  note?: string;
}

export interface TaskDetailDto {
  id: string;
  projectId: string;
  parentTaskId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  startDate?: string;
  dueDate?: string;
  durationDays?: number;
  sortOrder: number;
  completedAt?: string;
  assignees: TaskAssigneeDto[];
  comments: TaskCommentDto[];
  subTasks: TaskBoardDto[];
  timeEntries: TimeEntryDto[];
  totalTrackedMinutes: number;
  createdAt: string;
  createdByUser?: string;
}
