import { POST } from "../route";

jest.mock("@/lib/auth", () => ({
  hashPassword: jest.fn().mockResolvedValue("hashed"),
  getSession: jest.fn().mockResolvedValue({ user: undefined, save: jest.fn() }),
  parseSettings: jest.fn().mockReturnValue({}),
}));
jest.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({
        id: 1,
        username: "test",
        profileImagePath: null,
        characterImagePath: null,
        characterName: "Mathsie",
        settings: null,
      }),
    },
  },
}));

const makeRequest = (body: object) =>
  new Request("http://localhost/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as import("next/server").NextRequest;

describe("POST /api/auth/signup invite code", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, INVITE_CODE: "test-code" };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns 403 when invite code is wrong", async () => {
    const res = await POST(makeRequest({ username: "u", password: "password1", inviteCode: "wrong" }));
    expect(res.status).toBe(403);
  });

  it("returns 403 when invite code is missing", async () => {
    const res = await POST(makeRequest({ username: "u", password: "password1" }));
    expect(res.status).toBe(403);
  });

  it("returns 200 when invite code is correct", async () => {
    const res = await POST(makeRequest({ username: "u", password: "password1", inviteCode: "test-code" }));
    expect(res.status).toBe(200);
  });

  it("returns 500 when INVITE_CODE env var is not set", async () => {
    delete process.env.INVITE_CODE;
    const res = await POST(makeRequest({ username: "u", password: "password1", inviteCode: "any" }));
    expect(res.status).toBe(500);
  });
});
