import { hashPassword, verifyPassword, sessionOptions } from "../auth";

describe("auth helpers", () => {
  it("hashes a password", async () => {
    const hash = await hashPassword("secret123");
    expect(hash).not.toBe("secret123");
    expect(hash.length).toBeGreaterThan(20);
  });

  it("verifies correct password", async () => {
    const hash = await hashPassword("secret123");
    expect(await verifyPassword("secret123", hash)).toBe(true);
  });

  it("rejects wrong password", async () => {
    const hash = await hashPassword("secret123");
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});

describe("sessionOptions", () => {
  it("has httpOnly set", () => {
    expect(sessionOptions.cookieOptions.httpOnly).toBe(true);
  });

  it("has sameSite set to strict", () => {
    expect(sessionOptions.cookieOptions.sameSite).toBe("strict");
  });

  it("has maxAge set to 7 days", () => {
    expect(sessionOptions.cookieOptions.maxAge).toBe(60 * 60 * 24 * 7);
  });
});
