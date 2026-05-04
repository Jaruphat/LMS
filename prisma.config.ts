import { defineConfig } from "prisma/config"
import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.resolve(__dirname, ".env") })

const DATABASE_URL = process.env.DATABASE_URL
const SHADOW_DATABASE_URL = process.env.SHADOW_DATABASE_URL

if (!DATABASE_URL) throw new Error("DATABASE_URL is not set in .env")

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: DATABASE_URL,
    ...(SHADOW_DATABASE_URL ? { shadowDatabaseUrl: SHADOW_DATABASE_URL } : {}),
  },
})
