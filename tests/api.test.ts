/**
 * API endpoint tests (Vitest). Run against a live server (e.g. npm run dev).
 *
 *   npm run test         run all tests once
 *   npm run test:api     run only API tests
 *   npm run test:watch   watch mode
 *
 * Env: BASE_URL (default http://localhost:3000)
 *      TEST_EMAIL, TEST_PASSWORD (optional; enables authenticated tests)
 *
 * When you add or change an endpoint, add or update a test in the relevant describe block.
 */

import { describe, it, expect, beforeAll } from "vitest";

const DEFAULT_BASE = "http://localhost:3000";
const BASE_URL =
  (process.env.BASE_URL?.trim() || DEFAULT_BASE).replace(/\/$/, "") ||
  DEFAULT_BASE;
const FAKE_ID = "000000000000000000000001";

type RequestOptions = {
  body?: object;
  headers?: Record<string, string>;
};

async function apiRequest(
  method: string,
  path: string,
  options: RequestOptions = {}
): Promise<{ status: number; data: unknown; headers: Record<string, string> }> {
  const base = BASE_URL.replace(/\/$/, "");
  const pathPart = path.startsWith("/") ? path : `/${path}`;
  const url = path.startsWith("http") ? path : `${base}${pathPart}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  const res = await fetch(url, {
    method,
    headers,
    ...(options.body !== undefined && {
      body: JSON.stringify(options.body),
    }),
    redirect: "manual",
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  const resHeaders: Record<string, string> = {};
  res.headers.forEach((v, k) => {
    resHeaders[k] = v;
  });
  return { status: res.status, data, headers: resHeaders };
}

function expectStatusOneOf(actual: number, allowed: number | number[]) {
  const arr = Array.isArray(allowed) ? allowed : [allowed];
  expect(arr).toContain(actual);
}

let authCookie: string | null = null;

beforeAll(async () => {
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;
  if (email && password) {
    const url = `${BASE_URL}/api/auth/login`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      redirect: "manual",
    });
    if (res.status === 200) {
      const setCookie = res.headers.get("set-cookie");
      if (setCookie) authCookie = setCookie.split(";")[0].trim();
    }
  }
});

describe("Auth", () => {
  it("POST /api/auth/login with no body returns 400", async () => {
    const res = await apiRequest("POST", "/api/auth/login", { body: {} });
    expect(res.status).toBe(400);
  });

  it("POST /api/auth/login with missing password returns 400", async () => {
    const res = await apiRequest("POST", "/api/auth/login", {
      body: { email: "a@b.com" },
    });
    expect(res.status).toBe(400);
  });

  it("POST /api/auth/login with invalid credentials returns 401", async () => {
    const res = await apiRequest("POST", "/api/auth/login", {
      body: {
        email: "nonexistent@test.com",
        password: "wrong",
      },
    });
    expect(res.status).toBe(401);
  });

  it("POST /api/auth/register with no body returns 400", async () => {
    const res = await apiRequest("POST", "/api/auth/register", { body: {} });
    expect(res.status).toBe(400);
  });

  it("POST /api/auth/register with missing fields returns 400", async () => {
    const res = await apiRequest("POST", "/api/auth/register", {
      body: { name: "Test" },
    });
    expect(res.status).toBe(400);
  });

  it("GET /api/auth/me without cookie returns 401", async () => {
    const res = await apiRequest("GET", "/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("POST /api/auth/logout without cookie returns 200", async () => {
    const res = await apiRequest("POST", "/api/auth/logout");
    expect(res.status).toBe(200);
  });

  it("GET /api/auth/me with valid cookie returns 200", async () => {
    if (!authCookie) return;
    const res = await apiRequest("GET", "/api/auth/me", {
      headers: { Cookie: authCookie },
    });
    expect(res.status).toBe(200);
  });
});

describe("Products", () => {
  it("GET /api/products returns 200", async () => {
    const res = await apiRequest("GET", "/api/products");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });

  it("GET /api/products?section-format=true returns 200", async () => {
    const res = await apiRequest(
      "GET",
      "/api/products?section-format=true"
    );
    expect(res.status).toBe(200);
  });

  it("GET /api/products/:id with invalid id returns 400, 404 or 500", async () => {
    const res = await apiRequest("GET", "/api/products/invalid-id");
    expectStatusOneOf(res.status, [400, 404, 500]);
  });

  it("GET /api/products/:id with valid format returns 200 or 404", async () => {
    const res = await apiRequest("GET", `/api/products/${FAKE_ID}`);
    expectStatusOneOf(res.status, [200, 404]);
  });

  it("POST /api/products without auth returns 401", async () => {
    const res = await apiRequest("POST", "/api/products", { body: {} });
    expect(res.status).toBe(401);
  });

  it("PUT /api/products/:id without auth returns 401", async () => {
    const res = await apiRequest("PUT", `/api/products/${FAKE_ID}`, {
      body: {},
    });
    expect(res.status).toBe(401);
  });

  it("DELETE /api/products/:id without auth returns 401", async () => {
    const res = await apiRequest("DELETE", `/api/products/${FAKE_ID}`);
    expect(res.status).toBe(401);
  });
});

describe("Categories", () => {
  it("GET /api/categories returns 200", async () => {
    const res = await apiRequest("GET", "/api/categories");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });

  it("GET /api/categories/:id returns 200 or 404", async () => {
    const res = await apiRequest("GET", `/api/categories/${FAKE_ID}`);
    expectStatusOneOf(res.status, [200, 404]);
  });

  it("POST /api/categories without auth returns 401", async () => {
    const res = await apiRequest("POST", "/api/categories", {
      body: { name: { en: "Test", ar: "اختبار" }, image: "/img.png" },
    });
    expect(res.status).toBe(401);
  });

  it("PUT /api/categories/:id without auth returns 401", async () => {
    const res = await apiRequest("PUT", `/api/categories/${FAKE_ID}`, {
      body: { name: { en: "X", ar: "ي" }, image: "/x.png" },
    });
    expect(res.status).toBe(401);
  });

  it("DELETE /api/categories/:id without auth returns 401", async () => {
    const res = await apiRequest("DELETE", `/api/categories/${FAKE_ID}`);
    expect(res.status).toBe(401);
  });

  it("POST /api/categories with auth and missing name returns 400", async () => {
    if (!authCookie) return;
    const res = await apiRequest("POST", "/api/categories", {
      body: { image: "/x.png" },
      headers: { Cookie: authCookie },
    });
    expect(res.status).toBe(400);
  });

  it("POST /api/categories with auth and missing image returns 400", async () => {
    if (!authCookie) return;
    const res = await apiRequest("POST", "/api/categories", {
      body: { name: { en: "X", ar: "ي" } },
      headers: { Cookie: authCookie },
    });
    expect(res.status).toBe(400);
  });

  it("POST /api/categories with auth and valid body returns 201", async () => {
    if (!authCookie) return;
    const res = await apiRequest("POST", "/api/categories", {
      body: {
        name: { en: `Test Cat ${Date.now()}`, ar: "فئة" },
        image: "/test.png",
      },
      headers: { Cookie: authCookie },
    });
    expect(res.status).toBe(201);
  });
});

describe("Orders", () => {
  it("GET /api/orders without auth returns 401", async () => {
    const res = await apiRequest("GET", "/api/orders");
    expect(res.status).toBe(401);
  });

  it("POST /api/orders with no body returns 400", async () => {
    const res = await apiRequest("POST", "/api/orders", { body: {} });
    expect(res.status).toBe(400);
  });

  it("POST /api/orders with missing required fields returns 400", async () => {
    const res = await apiRequest("POST", "/api/orders", {
      body: { products: [] },
    });
    expect(res.status).toBe(400);
  });

  it("GET /api/orders/:id without auth returns 401", async () => {
    const res = await apiRequest("GET", `/api/orders/${FAKE_ID}`);
    expect(res.status).toBe(401);
  });

  it("PUT /api/orders/:id without auth returns 401", async () => {
    const res = await apiRequest("PUT", `/api/orders/${FAKE_ID}`, {
      body: { status: "pending" },
    });
    expect(res.status).toBe(401);
  });

  it("DELETE /api/orders/:id without auth returns 401", async () => {
    const res = await apiRequest("DELETE", `/api/orders/${FAKE_ID}`);
    expect(res.status).toBe(401);
  });

  it("GET /api/orders with auth returns 200", async () => {
    if (!authCookie) return;
    const res = await apiRequest("GET", "/api/orders", {
      headers: { Cookie: authCookie },
    });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });
});
