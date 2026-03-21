import { hashPassword, verifyPassword } from "../auth";

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
