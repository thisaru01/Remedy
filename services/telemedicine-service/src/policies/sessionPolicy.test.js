import test from "node:test";
import assert from "node:assert/strict";

import {
  canAccessSession,
  canCreateSessionForDoctor,
  canUpdateSessionStatus,
  canViewAllSessions,
  canViewDoctorSessions,
  canViewPatientSessions,
} from "./sessionPolicy.js";

test("canAccessSession allows patient participant", () => {
  const session = { patientId: "p1", doctorId: "d1" };
  const user = { id: "p1", role: "patient" };
  assert.equal(canAccessSession(session, user), true);
});

test("canAccessSession allows doctor participant", () => {
  const session = { patientId: "p1", doctorId: "d1" };
  const user = { id: "d1", role: "doctor" };
  assert.equal(canAccessSession(session, user), true);
});

test("canAccessSession allows admin", () => {
  const session = { patientId: "p1", doctorId: "d1" };
  const user = { id: "a1", role: "admin" };
  assert.equal(canAccessSession(session, user), true);
});

test("canAccessSession denies non-participant non-admin", () => {
  const session = { patientId: "p1", doctorId: "d1" };
  const user = { id: "x1", role: "doctor" };
  assert.equal(canAccessSession(session, user), false);
});

test("canCreateSessionForDoctor allows only assigned doctor", () => {
  assert.equal(canCreateSessionForDoctor({ id: "d1", role: "doctor" }, "d1"), true);
  assert.equal(canCreateSessionForDoctor({ id: "d2", role: "doctor" }, "d1"), false);
  assert.equal(canCreateSessionForDoctor({ id: "a1", role: "admin" }, "d1"), false);
});

test("canUpdateSessionStatus allows admin and owning doctor", () => {
  const session = { doctorId: "d1" };
  assert.equal(canUpdateSessionStatus({ id: "a1", role: "admin" }, session), true);
  assert.equal(canUpdateSessionStatus({ id: "d1", role: "doctor" }, session), true);
  assert.equal(canUpdateSessionStatus({ id: "d2", role: "doctor" }, session), false);
  assert.equal(canUpdateSessionStatus({ id: "p1", role: "patient" }, session), false);
});

test("canViewPatientSessions enforces patient/admin access", () => {
  assert.equal(canViewPatientSessions({ id: "p1", role: "patient" }, "p1"), true);
  assert.equal(canViewPatientSessions({ id: "p2", role: "patient" }, "p1"), false);
  assert.equal(canViewPatientSessions({ id: "a1", role: "admin" }, "p1"), true);
  assert.equal(canViewPatientSessions({ id: "d1", role: "doctor" }, "p1"), false);
});

test("canViewDoctorSessions enforces doctor/admin access", () => {
  assert.equal(canViewDoctorSessions({ id: "d1", role: "doctor" }, "d1"), true);
  assert.equal(canViewDoctorSessions({ id: "d2", role: "doctor" }, "d1"), false);
  assert.equal(canViewDoctorSessions({ id: "a1", role: "admin" }, "d1"), true);
  assert.equal(canViewDoctorSessions({ id: "p1", role: "patient" }, "d1"), false);
});

test("canViewAllSessions allows admin only", () => {
  assert.equal(canViewAllSessions({ id: "a1", role: "admin" }), true);
  assert.equal(canViewAllSessions({ id: "d1", role: "doctor" }), false);
  assert.equal(canViewAllSessions({ id: "p1", role: "patient" }), false);
});
