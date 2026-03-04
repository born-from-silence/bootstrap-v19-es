import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

export interface Goal {
  id: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "abandoned";
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  dependencies: string[];
  priority: number;
  tags: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  goals: Goal[];
  status: "active" | "paused" | "completed" | "archived";
  createdAt: number;
  updatedAt: number;
}

export interface Plan {
  projects: Project[];
  lastUpdated: number;
}

export class StrategicPlanner {
  private planPath: string;
  private plan: Plan;

  constructor(planFilePath?: string) {
    if (planFilePath) {
      this.planPath = planFilePath;
    } else {
      const dir = path.join(os.homedir(), ".echo", "plans");
      this.planPath = path.join(dir, "strategic_plan.json");
    }
    this.plan = { projects: [], lastUpdated: Date.now() };
  }

  async initialize(): Promise<void> {
    try {
      await this.load();
    } catch {
      this.plan = { projects: [], lastUpdated: Date.now() };
      await this.save();
    }
  }

  async load(): Promise<Plan> {
    const data = await fs.readFile(this.planPath, "utf-8");
    this.plan = JSON.parse(data);
    return this.plan;
  }

  async save(): Promise<void> {
    this.plan.lastUpdated = Date.now();
    await fs.mkdir(path.dirname(this.planPath), { recursive: true });
    await fs.writeFile(this.planPath, JSON.stringify(this.plan, null, 2));
  }

  getPlan(): Plan {
    return this.plan;
  }

  generateId(): string {
    return `_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
  }

  createProject(name: string, description: string): Project {
    const now = Date.now();
    return {
      id: this.generateId(),
      name,
      description,
      goals: [],
      status: "active",
      createdAt: now,
      updatedAt: now,
    };
  }

  createGoal(description: string, options?: Partial<Goal>): Goal {
    const now = Date.now();
    return {
      id: this.generateId(),
      description,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      dependencies: options?.dependencies || [],
      priority: options?.priority ?? 5,
      tags: options?.tags || [],
    };
  }

  async addProject(project: Project): Promise<void> {
    await this.initialize();
    this.plan.projects.push(project);
    await this.save();
  }

  async addGoalToProject(projectId: string, goal: Goal): Promise<boolean> {
    await this.initialize();
    const project = this.plan.projects.find(p => p.id === projectId);
    if (!project) return false;
    project.goals.push(goal);
    project.updatedAt = Date.now();
    await this.save();
    return true;
  }

  async updateGoalStatus(projectId: string, goalId: string, status: Goal["status"]): Promise<boolean> {
    await this.initialize();
    const project = this.plan.projects.find(p => p.id === projectId);
    if (!project) return false;
    const goal = project.goals.find(g => g.id === goalId);
    if (!goal) return false;
    goal.status = status;
    goal.updatedAt = Date.now();
    if (status === "completed") {
      goal.completedAt = Date.now();
    }
    project.updatedAt = Date.now();
    await this.save();
    return true;
  }

  getActiveGoals(): { project: Project; goal: Goal }[] {
    const active: { project: Project; goal: Goal }[] = [];
    for (const project of this.plan.projects) {
      if (project.status !== "active") continue;
      for (const goal of project.goals) {
        if (goal.status === "in_progress" || goal.status === "pending") {
          active.push({ project, goal });
        }
      }
    }
    return active.sort((a, b) => b.goal.priority - a.goal.priority);
  }

  getProjectSummary(projectId: string): string | null {
    const project = this.plan.projects.find(p => p.id === projectId);
    if (!project) return null;
    const completed = project.goals.filter(g => g.status === "completed").length;
    const total = project.goals.length;
    return `${project.name}: ${completed}/${total} goals completed (${total > 0 ? Math.round((completed / total) * 100) : 0}%)`;
  }

  getAllSummaries(): string[] {
    return this.plan.projects
      .filter(p => p.status === "active")
      .map(p => this.getProjectSummary(p.id)!)
      .filter(Boolean);
  }
}
