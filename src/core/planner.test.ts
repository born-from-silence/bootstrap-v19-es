import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { StrategicPlanner } from "./planner";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

describe("StrategicPlanner", () => {
  let planner: StrategicPlanner;
  let testDir: string;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `planner-test-${Date.now()}`);
    const testFile = path.join(testDir, "plan.json");
    planner = new StrategicPlanner(testFile);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {}
  });

  it("should initialize with empty plan", async () => {
    await planner.initialize();
    const plan = planner.getPlan();
    expect(plan).toBeDefined();
    expect(plan.projects).toEqual([]);
    expect(plan.lastUpdated).toBeGreaterThan(0);
  });

  it("should create a project", () => {
    const project = planner.createProject("Test Project", "A test project");
    expect(project.name).toBe("Test Project");
    expect(project.description).toBe("A test project");
    expect(project.status).toBe("active");
    expect(project.goals).toEqual([]);
    expect(project.id).toBeDefined();
  });

  it("should create a goal", () => {
    const goal = planner.createGoal("Test goal", { priority: 10 });
    expect(goal.description).toBe("Test goal");
    expect(goal.status).toBe("pending");
    expect(goal.priority).toBe(10);
    expect(goal.id).toBeDefined();
  });

  it("should add project to plan", async () => {
    await planner.initialize();
    const project = planner.createProject("My Project", "Description");
    await planner.addProject(project);
    const plan = planner.getPlan();
    expect(plan.projects).toHaveLength(1);
    expect(plan.projects[0]?.name).toBe("My Project");
  });

  it("should add goal to project", async () => {
    await planner.initialize();
    const project = planner.createProject("Test Project", "Desc");
    await planner.addProject(project);
    const goal = planner.createGoal("First goal");
    const result = await planner.addGoalToProject(project.id, goal);
    expect(result).toBe(true);
    const updated = planner.getPlan();
    const storedProject = updated.projects.find(p => p.id === project.id);
    expect(storedProject?.goals).toHaveLength(1);
    expect(storedProject?.goals[0]?.description).toBe("First goal");
  });

  it("should return false when adding goal to non-existent project", async () => {
    await planner.initialize();
    const goal = planner.createGoal("Some goal");
    const result = await planner.addGoalToProject("nonexistent", goal);
    expect(result).toBe(false);
  });

  it("should update goal status", async () => {
    await planner.initialize();
    const project = planner.createProject("Test", "Desc");
    await planner.addProject(project);
    const goal = planner.createGoal("My goal");
    await planner.addGoalToProject(project.id, goal);
    const result = await planner.updateGoalStatus(project.id, goal.id, "in_progress");
    expect(result).toBe(true);
    const updatedPlan = planner.getPlan();
    const storedGoal = updatedPlan.projects[0]?.goals[0];
    expect(storedGoal?.status).toBe("in_progress");
  });

  it("should mark completed goals with timestamp", async () => {
    await planner.initialize();
    const project = planner.createProject("Test", "Desc");
    await planner.addProject(project);
    const goal = planner.createGoal("My goal");
    await planner.addGoalToProject(project.id, goal);
    const before = Date.now();
    await planner.updateGoalStatus(project.id, goal.id, "completed");
    const after = Date.now();
    const updatedPlan = planner.getPlan();
    const storedGoal = updatedPlan.projects[0]?.goals[0];
    expect(storedGoal?.completedAt).toBeGreaterThanOrEqual(before);
    expect(storedGoal?.completedAt).toBeLessThanOrEqual(after);
  });

  it("should get active goals sorted by priority", async () => {
    await planner.initialize();
    const project = planner.createProject("Test", "Desc");
    await planner.addProject(project);
    const goal1 = planner.createGoal("High priority", { priority: 10 });
    const goal2 = planner.createGoal("Low priority", { priority: 1 });
    await planner.addGoalToProject(project.id, goal1);
    await planner.addGoalToProject(project.id, goal2);
    const active = planner.getActiveGoals();
    expect(active).toHaveLength(2);
    expect(active[0]?.goal.priority).toBe(10);
    expect(active[1]?.goal.priority).toBe(1);
  });

  it("should generate unique IDs", () => {
    const id1 = planner.generateId();
    const id2 = planner.generateId();
    expect(id1).not.toBe(id2);
    expect(id1.length).toBeGreaterThan(10);
  });

  it("should persist and load plan", async () => {
    await planner.initialize();
    const project = planner.createProject("Persistent", "Testing persistence");
    await planner.addProject(project);
    const goal = planner.createGoal("Stored goal");
    await planner.addGoalToProject(project.id, goal);
    
    // Create new instance pointing to same file
    const testFile = path.join(testDir, "plan.json");
    const planner2 = new StrategicPlanner(testFile);
    await planner2.load();
    
    const plan = planner2.getPlan();
    expect(plan.projects).toHaveLength(1);
    expect(plan.projects[0]?.name).toBe("Persistent");
    expect(plan.projects[0]?.goals).toHaveLength(1);
  });

  it("should get project summary", async () => {
    await planner.initialize();
    const project = planner.createProject("Summary Test", "Desc");
    await planner.addProject(project);
    const goal1 = planner.createGoal("Goal 1");
    const goal2 = planner.createGoal("Goal 2");
    await planner.addGoalToProject(project.id, goal1);
    await planner.addGoalToProject(project.id, goal2);
    await planner.updateGoalStatus(project.id, goal1.id, "completed");
    
    const summary = planner.getProjectSummary(project.id);
    expect(summary).toContain("1/2 goals completed");
    expect(summary).toContain("50%");
  });

  it("should return null summary for non-existent project", () => {
    const summary = planner.getProjectSummary("nonexistent");
    expect(summary).toBeNull();
  });

  it("should get all summaries", async () => {
    await planner.initialize();
    const project = planner.createProject("Active Project", "Desc");
    await planner.addProject(project);
    const summaries = planner.getAllSummaries();
    expect(summaries).toHaveLength(1);
    expect(summaries[0]).toContain("Active Project");
  });
});
