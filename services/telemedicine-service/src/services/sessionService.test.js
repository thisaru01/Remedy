import test from "node:test";
import assert from "node:assert/strict";

import {
  __resetSessionServiceDepsForTest,
  __setSessionServiceDepsForTest,
  getAccessibleSessionByIdOrError,
  getAccessibleSessionByAppointmentIdOrError,
  getPaginatedSessions,
  getSessionByIdOrError,
  parsePaginationQuery,
  validateCreateSessionPayload,
  validateSessionStatusInput,
} from "./sessionService.js";

test.beforeEach(() => {
  __resetSessionServiceDepsForTest();
});

test.afterEach(() => {
  __resetSessionServiceDepsForTest();
});

test("validateCreateSessionPayload returns error when required fields are missing", () => {
  const result = validateCreateSessionPayload({
    appointmentId: "a1",
    patientId: "p1",
    doctorId: "d1",
  });

  assert.equal(result.error.status, 400);
  assert.match(result.error.message, /Missing required fields/);
});

test("validateCreateSessionPayload returns ok for complete payload", () => {
  const result = validateCreateSessionPayload({
    appointmentId: "a1",
    patientId: "p1",
    doctorId: "d1",
    scheduledAt: "2026-03-28T10:00:00.000Z",
  });

  assert.deepEqual(result, { ok: true });
});

test("validateSessionStatusInput rejects invalid status", () => {
  const result = validateSessionStatusInput("paused");

  assert.equal(result.error.status, 400);
  assert.match(result.error.message, /Invalid status/);
});

test("validateSessionStatusInput accepts valid status", () => {
  const result = validateSessionStatusInput("active");
  assert.deepEqual(result, { ok: true });
});

test("parsePaginationQuery uses defaults for missing values", () => {
  const result = parsePaginationQuery({});
  assert.deepEqual(result, { page: 1, limit: 10, skip: 0 });
});

test("parsePaginationQuery normalizes and clamps values", () => {
  const result = parsePaginationQuery({ page: "2.8", limit: "200" });
  assert.deepEqual(result, { page: 2, limit: 50, skip: 50 });
});

test("parsePaginationQuery falls back for non-positive values", () => {
  const result = parsePaginationQuery({ page: "0", limit: "-1" });
  assert.deepEqual(result, { page: 1, limit: 10, skip: 0 });
});

test("getSessionByIdOrError returns 400 for malformed ObjectId", async () => {
  const result = await getSessionByIdOrError("not-an-object-id");

  assert.equal(result.error.status, 400);
  assert.equal(result.error.message, "Invalid session ID format");
});

test("getAccessibleSessionByAppointmentIdOrError requires appointmentId", async () => {
  const result = await getAccessibleSessionByAppointmentIdOrError("", { id: "p1", role: "patient" });

  assert.equal(result.error.status, 400);
  assert.equal(result.error.message, "Appointment ID is required");
});

test("getSessionByIdOrError returns 404 when valid id has no session", async () => {
  __setSessionServiceDepsForTest({
    findSessionById: async () => null,
  });

  const result = await getSessionByIdOrError("507f1f77bcf86cd799439011");

  assert.equal(result.error.status, 404);
  assert.equal(result.error.message, "Session not found");
});

test("getAccessibleSessionByIdOrError returns 403 for non-participant", async () => {
  __setSessionServiceDepsForTest({
    findSessionById: async () => ({ id: "s1", patientId: "p1", doctorId: "d1" }),
    canAccessSession: () => false,
  });

  const result = await getAccessibleSessionByIdOrError("507f1f77bcf86cd799439011", { id: "x1", role: "doctor" });

  assert.equal(result.error.status, 403);
  assert.match(result.error.message, /Access denied/);
});

test("getAccessibleSessionByAppointmentIdOrError returns 404 when session does not exist", async () => {
  __setSessionServiceDepsForTest({
    findSessionByAppointmentId: async () => null,
  });

  const result = await getAccessibleSessionByAppointmentIdOrError("appt-1", { id: "p1", role: "patient" });

  assert.equal(result.error.status, 404);
  assert.equal(result.error.message, "Session not found for this appointment");
});

test("getAccessibleSessionByAppointmentIdOrError returns 403 for unauthorized user", async () => {
  __setSessionServiceDepsForTest({
    findSessionByAppointmentId: async () => ({ id: "s1", appointmentId: "appt-1", patientId: "p1", doctorId: "d1" }),
    canAccessSession: () => false,
  });

  const result = await getAccessibleSessionByAppointmentIdOrError("appt-1", { id: "x1", role: "doctor" });

  assert.equal(result.error.status, 403);
  assert.match(result.error.message, /Access denied/);
});

test("getPaginatedSessions returns shaped pagination payload", async () => {
  __setSessionServiceDepsForTest({
    listSessions: async ({ filter, sort, skip, limit }) => {
      assert.deepEqual(filter, { doctorId: "d1" });
      assert.deepEqual(sort, { scheduledAt: -1 });
      assert.equal(skip, 2);
      assert.equal(limit, 2);
      return [{ id: "s1" }, { id: "s2" }];
    },
    countSessions: async (filter) => {
      assert.deepEqual(filter, { doctorId: "d1" });
      return 5;
    },
  });

  const result = await getPaginatedSessions({
    filter: { doctorId: "d1" },
    query: { page: "2", limit: "2" },
  });

  assert.deepEqual(result, {
    page: 2,
    limit: 2,
    total: 5,
    totalPages: 3,
    count: 2,
    data: [{ id: "s1" }, { id: "s2" }],
  });
});
