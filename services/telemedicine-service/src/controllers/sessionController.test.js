import test from "node:test";
import assert from "node:assert/strict";

import {
  __resetSessionControllerDepsForTest,
  __setSessionControllerDepsForTest,
  createSession,
  getAllSessions,
  getSessionById,
  getSessionJoinDetails,
  updateSessionStatus,
} from "./sessionController.js";

const createRes = () => {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  return res;
};

test.beforeEach(() => {
  __resetSessionControllerDepsForTest();
});

test.afterEach(() => {
  __resetSessionControllerDepsForTest();
});

test("createSession returns 400 when payload validation fails", async () => {
  __setSessionControllerDepsForTest({
    validateCreateSessionPayload: () => ({
      error: { status: 400, message: "Missing required fields" },
    }),
  });

  const req = { body: {}, user: { id: "d1", role: "doctor" } };
  const res = createRes();
  let nextCalled = false;

  await createSession(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
});

test("createSession returns 403 when doctor ownership check fails", async () => {
  __setSessionControllerDepsForTest({
    validateCreateSessionPayload: () => ({ ok: true }),
    canCreateSessionForDoctor: () => false,
  });

  const req = {
    body: {
      appointmentId: "a1",
      patientId: "p1",
      doctorId: "d1",
    },
    user: { id: "d2", role: "doctor" },
  };
  const res = createRes();

  await createSession(req, res, () => {});

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.success, false);
});

test("createSession returns 503 when appointment validation throws", async () => {
  __setSessionControllerDepsForTest({
    validateCreateSessionPayload: () => ({ ok: true }),
    canCreateSessionForDoctor: () => true,
    validateWithAppointmentService: async () => {
      throw new Error("appointment down");
    },
  });

  const req = {
    body: {
      appointmentId: "a1",
      patientId: "p1",
      doctorId: "d1",
    },
    user: { id: "d1", role: "doctor", name: "Dr One" },
  };
  const res = createRes();

  await createSession(req, res, () => {});

  assert.equal(res.statusCode, 503);
  assert.equal(res.body.success, false);
});

test("createSession returns 201 on success", async () => {
  __setSessionControllerDepsForTest({
    validateCreateSessionPayload: () => ({ ok: true }),
    canCreateSessionForDoctor: () => true,
    validateWithAppointmentService: async () => true,
    generateSecureRoomUrl: () => ({ roomName: "room-1", joinUrl: "https://meet/room-1" }),
    createSessionRecord: async (payload) => ({ id: "s1", ...payload }),
  });

  const req = {
    body: {
      appointmentId: "a1",
      patientId: "p1",
      doctorId: "d1",
    },
    user: { id: "d1", role: "doctor", name: "Dr One" },
  };
  const res = createRes();

  await createSession(req, res, () => {});

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.status, "scheduled");
});

test("updateSessionStatus returns 400 when status is invalid", async () => {
  __setSessionControllerDepsForTest({
    validateSessionStatusInput: () => ({
      error: { status: 400, message: "Invalid status" },
    }),
  });

  const req = {
    body: { status: "bad" },
    params: { id: "507f1f77bcf86cd799439011" },
    user: { id: "d1", role: "doctor" },
  };
  const res = createRes();

  await updateSessionStatus(req, res, () => {});

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
});

test("updateSessionStatus returns 403 for unauthorized updater", async () => {
  const session = {
    id: "s1",
    doctorId: "d1",
    status: "scheduled",
    save: async () => undefined,
  };

  __setSessionControllerDepsForTest({
    validateSessionStatusInput: () => ({ ok: true }),
    getSessionByIdOrError: async () => ({ session }),
    canUpdateSessionStatus: () => false,
  });

  const req = {
    body: { status: "active" },
    params: { id: "507f1f77bcf86cd799439011" },
    user: { id: "p1", role: "patient" },
  };
  const res = createRes();

  await updateSessionStatus(req, res, () => {});

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.success, false);
});

test("updateSessionStatus returns 200 and sets startedAt when activating", async () => {
  const session = {
    id: "s1",
    doctorId: "d1",
    status: "scheduled",
    startedAt: null,
    endedAt: null,
    save: async () => undefined,
  };

  __setSessionControllerDepsForTest({
    validateSessionStatusInput: () => ({ ok: true }),
    getSessionByIdOrError: async () => ({ session }),
    canUpdateSessionStatus: () => true,
  });

  const req = {
    body: { status: "active" },
    params: { id: "507f1f77bcf86cd799439011" },
    user: { id: "d1", role: "doctor" },
  };
  const res = createRes();

  await updateSessionStatus(req, res, () => {});

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(session.status, "active");
  assert.ok(session.startedAt instanceof Date);
});

test("getSessionById maps service error response", async () => {
  __setSessionControllerDepsForTest({
    getAccessibleSessionByIdOrError: async () => ({
      error: { status: 404, message: "Session not found" },
    }),
  });

  const req = {
    params: { id: "507f1f77bcf86cd799439011" },
    user: { id: "p1", role: "patient" },
  };
  const res = createRes();

  await getSessionById(req, res, () => {});

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.success, false);
});

test("getAllSessions returns 403 for non-admin", async () => {
  __setSessionControllerDepsForTest({
    canViewAllSessions: () => false,
  });

  const req = { query: {}, user: { id: "d1", role: "doctor" } };
  const res = createRes();

  await getAllSessions(req, res, () => {});

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.success, false);
});

test("getAllSessions returns paginated payload for admin", async () => {
  __setSessionControllerDepsForTest({
    canViewAllSessions: () => true,
    getPaginatedSessions: async () => ({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
      count: 1,
      data: [{ id: "s1" }],
    }),
  });

  const req = { query: {}, user: { id: "a1", role: "admin" } };
  const res = createRes();

  await getAllSessions(req, res, () => {});

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.total, 1);
  assert.equal(res.body.count, 1);
});

test("getSessionJoinDetails always returns JaaS mode with token", async () => {
  __setSessionControllerDepsForTest({
    getAccessibleSessionByIdOrError: async () => ({
      session: { roomName: "room-1", joinUrl: "https://meet/room-1" },
    }),
    mintJaasRoomToken: () => "token-123",
  });

  const req = {
    params: { id: "507f1f77bcf86cd799439011" },
    user: { id: "d1", role: "doctor" },
  };
  const res = createRes();

  await getSessionJoinDetails(req, res, () => {});

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.mode, "jaas");
  assert.equal(res.body.data.token, "token-123");
});
