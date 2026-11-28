import { beforeEach, describe, expect, it } from "vitest";
import { openDb } from "./db";
import { createTask, listTasks, moveTask, RuleViolation } from "./tasks";
import type { DatabaseSync } from "node:sqlite";

let db: DatabaseSync;
beforeEach(() => {
  db = openDb(":memory:");
});

describe("tasks", () => {
  it("creates a task in todo", () => {
    const t = createTask(db, { title: "Write the team agreement", estimateHours: 2 });
    expect(t.status).toBe("todo");
    expect(listTasks(db)).toHaveLength(1);
  });

  it("rejects an empty title", () => {
    expect(() => createTask(db, { title: "  " })).toThrow(RuleViolation);
  });

  it("follows todo → doing → done and keeps done final", () => {
    const t = createTask(db, { title: "Add a hook" });
    moveTask(db, t.id, "doing");
    moveTask(db, t.id, "done");
    expect(() => moveTask(db, t.id, "todo")).toThrow(RuleViolation);
  });

  it("does not skip doing", () => {
    const t = createTask(db, { title: "Path rule" });
    expect(() => moveTask(db, t.id, "done")).toThrow(RuleViolation);
  });
});

// TASK-7: docs/specs/TASK-7.md
describe("estimateHours", () => {
  const MESSAGE = "estimateHours must be a whole number 1..40";

  it("accepts 1 (lower boundary)", () => {
    expect(createTask(db, { title: "Min", estimateHours: 1 }).estimateHours).toBe(1);
  });

  it("accepts 40 (upper boundary)", () => {
    expect(createTask(db, { title: "Max", estimateHours: 40 }).estimateHours).toBe(40);
  });

  it.each([0, 41, 1.5, "3", "abc"])("rejects %j with the message and stores nothing", (value) => {
    expect(() => createTask(db, { title: "Bad estimate", estimateHours: value })).toThrow(new RuleViolation(MESSAGE));
    expect(listTasks(db)).toHaveLength(0);
  });

  it.each([null, true, "40"])("rejects %j with the message (D1–D3)", (value) => {
    expect(() => createTask(db, { title: "Bad estimate", estimateHours: value })).toThrow(new RuleViolation(MESSAGE));
  });

  it("creates a task without estimateHours with estimateHours: null", () => {
    expect(createTask(db, { title: "No estimate" }).estimateHours).toBeNull();
  });
});
