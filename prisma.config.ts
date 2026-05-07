import "dotenv/config";
import { defineConfig } from "prisma/config";

function getSqliteDatasourceUrl() {
  const configuredUrl = process.env["DATABASE_URL"];

  if (configuredUrl === ":memory:" || configuredUrl?.startsWith("file:")) {
    return configuredUrl;
  }

  return "file:./dev.db";
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: getSqliteDatasourceUrl(),
  },
});
