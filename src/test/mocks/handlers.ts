/**
 * MSW v2 handlers — mock all Spring Boot endpoints used by ZephLearn.
 * Uses realistic ZephLearn fixture data so tests double as living documentation.
 */
import { http, HttpResponse } from "msw";
import {
  MOCK_LOGIN_RESPONSE,
  MOCK_ADMIN_LOGIN_RESPONSE,
  MOCK_PROFILE_RESPONSE,
  MOCK_API_PROBLEMS,
  MOCK_SUBMIT_RESPONSE_ACCEPTED,
  MOCK_RUN_ACCEPTED,
  MOCK_SUBMISSIONS,
  MOCK_NOTIFICATIONS,
} from "../fixtures/zephlearn-data";

const BASE = "https://zeph-learn-backend.onrender.com";

// ─── Auth ─────────────────────────────────────────────────────────────────────

const authLoginHandler = http.post(`${BASE}/api/auth/login`, async ({ request }) => {
  const body = (await request.json()) as { email: string; password: string };

  if (body.email === "admin@zephlearn.com" && body.password === "admin123") {
    return HttpResponse.json(MOCK_ADMIN_LOGIN_RESPONSE);
  }

  if (body.email === "priya@example.com" && body.password === "password123") {
    return HttpResponse.json(MOCK_LOGIN_RESPONSE);
  }

  return HttpResponse.json(
    { error: "Invalid credentials" },
    { status: 401 }
  );
});

const authSignupHandler = http.post(`${BASE}/api/auth/signup`, async ({ request }) => {
  const body = (await request.json()) as { name: string; email: string; password: string };

  if (body.email === "existing@example.com") {
    return HttpResponse.json(
      { error: "Email already registered" },
      { status: 400 }
    );
  }

  return HttpResponse.json({
    token: "eyJhbGciOiJIUzI1NiJ9.new_user_token.fake_sig",
    id: "999",
    name: body.name,
    email: body.email,
    role: "user",
    streak: 0,
  });
});

const authGoogleHandler = http.post(`${BASE}/api/auth/google`, async ({ request }) => {
  const body = (await request.json()) as { idToken: string };
  if (!body.idToken) {
    return HttpResponse.json({ error: "Google sign-in failed" }, { status: 400 });
  }
  return HttpResponse.json(MOCK_LOGIN_RESPONSE);
});

// ─── Users / Profile ─────────────────────────────────────────────────────────

const profileHandler = http.get(`${BASE}/api/users/profile/:id`, ({ params }) => {
  const { id } = params;
  if (id === "101") {
    return HttpResponse.json(MOCK_PROFILE_RESPONSE);
  }
  if (id === "1") {
    return HttpResponse.json({
      ...MOCK_PROFILE_RESPONSE,
      id: "1",
      name: "Pragadeesh Admin",
      email: "admin@zephlearn.com",
      role: "admin",
      streak: 30,
      rank: 1,
    });
  }
  return HttpResponse.json({ error: "User not found" }, { status: 404 });
});

const usersListHandler = http.get(`${BASE}/api/users`, ({ request }) => {
  const auth = request.headers.get("Authorization");
  if (!auth) return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
  return HttpResponse.json([MOCK_PROFILE_RESPONSE]);
});

const deleteUserHandler = http.delete(`${BASE}/api/users/:id`, () => {
  return new HttpResponse(null, { status: 204 });
});

// ─── Problems ─────────────────────────────────────────────────────────────────

const problemsListHandler = http.get(`${BASE}/api/problems`, () => {
  return HttpResponse.json(MOCK_API_PROBLEMS);
});

const problemDetailHandler = http.get(`${BASE}/api/problems/:id`, ({ params }) => {
  const { id } = params;
  const problem = MOCK_API_PROBLEMS.find((p) => String(p.id) === id);
  if (!problem) {
    return HttpResponse.json({ error: "Problem not found" }, { status: 404 });
  }
  return HttpResponse.json(problem);
});

const problemCreateHandler = http.post(`${BASE}/api/problems`, async ({ request }) => {
  const body = await request.json();
  return HttpResponse.json({ ...body, id: 99 }, { status: 201 });
});

const problemUpdateHandler = http.put(`${BASE}/api/problems/:id`, async ({ request, params }) => {
  const body = await request.json();
  return HttpResponse.json({ ...body, id: Number(params.id) });
});

const problemDeleteHandler = http.delete(`${BASE}/api/problems/:id`, () => {
  return new HttpResponse(null, { status: 204 });
});

// ─── Code Execution ───────────────────────────────────────────────────────────

const runCodeHandler = http.post(`${BASE}/api/submissions/run`, async ({ request }) => {
  const body = (await request.json()) as { code: string; language: string; stdin?: string };

  // Simulate compile error for marker code
  if (body.code.includes("COMPILE_ERROR")) {
    return HttpResponse.json({
      stdout: null,
      stderr: "SyntaxError: invalid syntax (line 1)",
      verdict: "Compilation Error",
      executionTime: null,
      memory: null,
    });
  }

  return HttpResponse.json(MOCK_RUN_ACCEPTED);
});

// ─── Submissions ──────────────────────────────────────────────────────────────

const submitHandler = http.post(`${BASE}/api/submissions/submit`, async ({ request }) => {
  const body = (await request.json()) as { problemId: number; code: string; language: string };

  if (body.code.includes("WRONG")) {
    return HttpResponse.json({
      verdict: "Wrong Answer",
      passedCount: 1,
      totalCount: 3,
      results: [
        { input: "2 7 11 15\n9", expectedOutput: "0 1", actualOutput: "0 2", passed: false, executionTime: "0.03s" },
      ],
      executionTime: "0.03s",
      memory: "10240",
    });
  }

  return HttpResponse.json(MOCK_SUBMIT_RESPONSE_ACCEPTED);
});

const submissionsUserHandler = http.get(`${BASE}/api/submissions/user/:id`, ({ params }) => {
  const { id } = params;
  const filtered = MOCK_SUBMISSIONS.filter((s) => s.userId === id);
  return HttpResponse.json(filtered);
});

const submissionsProblemHandler = http.get(
  `${BASE}/api/submissions/problem/:id`,
  ({ params }) => {
    const { id } = params;
    const filtered = MOCK_SUBMISSIONS.filter((s) => s.problemId === id);
    return HttpResponse.json(filtered);
  }
);

const submissionsCountHandler = http.get(`${BASE}/api/submissions/count`, () => {
  return HttpResponse.json(MOCK_SUBMISSIONS.length);
});

// ─── Notifications ────────────────────────────────────────────────────────────

const notificationsListHandler = http.get(`${BASE}/api/notifications`, ({ request }) => {
  const auth = request.headers.get("Authorization");
  if (!auth) return HttpResponse.json([], { status: 200 }); // returns empty for unauthed (graceful)
  return HttpResponse.json(MOCK_NOTIFICATIONS);
});

const notificationMarkReadHandler = http.patch(
  `${BASE}/api/notifications/:id/read`,
  ({ params }) => {
    const { id } = params;
    const notification = MOCK_NOTIFICATIONS.find((n) => String(n.id) === id);
    if (!notification) {
      return HttpResponse.json({ error: "Not found" }, { status: 404 });
    }
    return HttpResponse.json({ ...notification, isRead: true, readAt: new Date().toISOString() });
  }
);

// ─── Admin Notifications ──────────────────────────────────────────────────────

const adminNotifyHandler = http.post(`${BASE}/api/admin/notifications`, async ({ request }) => {
  const body = (await request.json()) as { title: string; message: string };
  if (!body.title || !body.message) {
    return HttpResponse.json({ error: "Title and message required" }, { status: 400 });
  }
  return HttpResponse.json({ id: 99, ...body, createdAt: new Date().toISOString() }, { status: 201 });
});

// ─── Export all handlers ──────────────────────────────────────────────────────

export const handlers = [
  // Auth
  authLoginHandler,
  authSignupHandler,
  authGoogleHandler,
  // Users
  profileHandler,
  usersListHandler,
  deleteUserHandler,
  // Problems
  problemsListHandler,
  problemDetailHandler,
  problemCreateHandler,
  problemUpdateHandler,
  problemDeleteHandler,
  // Execution
  runCodeHandler,
  // Submissions
  submitHandler,
  submissionsUserHandler,
  submissionsProblemHandler,
  submissionsCountHandler,
  // Notifications
  notificationsListHandler,
  notificationMarkReadHandler,
  adminNotifyHandler,
];

// ─── Exported error override helpers ─────────────────────────────────────────

/** Override login to return 500 for error-handling tests */
export const loginServerError = http.post(`${BASE}/api/auth/login`, () =>
  HttpResponse.json({ error: "Internal server error" }, { status: 500 })
);

/** Override problems list to return 500 */
export const problemsServerError = http.get(`${BASE}/api/problems`, () =>
  HttpResponse.json({ error: "Internal server error" }, { status: 500 })
);

/** Override notifications to return 500 */
export const notificationsServerError = http.get(`${BASE}/api/notifications`, () =>
  HttpResponse.json({ error: "Internal server error" }, { status: 500 })
);

/** Override submit to return 401 (expired JWT) */
export const submitUnauthorized = http.post(`${BASE}/api/submissions/submit`, () =>
  HttpResponse.json({ error: "JWT token expired" }, { status: 401 })
);

/** Network failure handler for auth login */
export const loginNetworkError = http.post(`${BASE}/api/auth/login`, () =>
  HttpResponse.error()
);
