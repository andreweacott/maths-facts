import path from "node:path";
import { defineConfig } from "prisma/config";

const rawUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const authToken = process.env.DATABASE_AUTH_TOKEN;

const datasourceUrl =
  authToken && rawUrl.startsWith("libsql://")
    ? `${rawUrl.replace("libsql://", "https://")}?authToken=${authToken}`
    : rawUrl;

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: datasourceUrl,
  },
});
