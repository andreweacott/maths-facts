// Use a separate test DB so tests don't corrupt dev data
process.env.DATABASE_URL = "file:./prisma/test.db";
process.env.SESSION_SECRET = "test-secret-at-least-32-characters-long";
process.env.ANTHROPIC_API_KEY = "test-key";
