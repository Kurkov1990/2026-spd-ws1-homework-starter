// TASK-7: docs/specs/TASK-7.md — HTTP status for estimateHours (AC2, AC3)
import { beforeAll, describe, expect, it, vi } from "vitest";

let POST: (request: Request) => Promise<Response>;
beforeAll(async () => {
  vi.stubEnv("DB_FILE", ":memory:"); // db() is a singleton that reads DB_FILE once; never data/tasks.db
  ({ POST } = await import("./route"));
});

const post = (body: unknown) =>
  POST(new Request("http://localhost/api/tasks", { method: "POST", body: JSON.stringify(body) }));
const MESSAGE = "estimateHours must be a whole number 1..40";

describe("POST /api/tasks estimateHours", () => {
  it.each([1.5, "abc"])("returns 422 for %j", async (value) => {
    const res = await post({ title: "Bad estimate", estimateHours: value });
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({ error: MESSAGE });
  });

  it("returns 201 for a whole-hour estimate", async () => {
    const res = await post({ title: "Good estimate", estimateHours: 3 });
    expect(res.status).toBe(201);
    expect((await res.json()).estimateHours).toBe(3);
  });

  it("returns 201 with estimateHours: null when the field is absent", async () => {
    const res = await post({ title: "No estimate" });
    expect(res.status).toBe(201);
    expect((await res.json()).estimateHours).toBeNull();
  });
});
