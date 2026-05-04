import { defineConfig } from "prisma/config"
import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.resolve(__dirname, ".env.local") })
dotenv.config({ path: path.resolve(__dirname, ".env") })

const DATABASE_URL = process.env.DATABASE_URL
const SHADOW_DATABASE_URL = process.env.SHADOW_DATABASE_URL

const PLACEHOLDER_DATABASE_URL = "postgresql://placeholder:placeholder@localhost:5432/placeholder"

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: DATABASE_URL ?? PLACEHOLDER_DATABASE_URL,
    ...(SHADOW_DATABASE_URL ? { shadowDatabaseUrl: SHADOW_DATABASE_URL } : {}),
  },
})
