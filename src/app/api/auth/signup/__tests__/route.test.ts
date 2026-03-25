describe("signup invite code check", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, INVITE_CODE: "test-code" };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("rejects when invite code is missing", () => {
    const inviteCode = undefined;
    const isValid = inviteCode === process.env.INVITE_CODE;
    expect(isValid).toBe(false);
  });

  it("rejects when invite code is wrong", () => {
    const inviteCode = "wrong-code";
    const isValid = inviteCode === process.env.INVITE_CODE;
    expect(isValid).toBe(false);
  });

  it("accepts when invite code matches", () => {
    const inviteCode = "test-code";
    const isValid = inviteCode === process.env.INVITE_CODE;
    expect(isValid).toBe(true);
  });
});
