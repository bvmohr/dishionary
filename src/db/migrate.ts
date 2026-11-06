import { readFileSync } from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

async function applyMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("Error: DATABASE_URL is not set in .env.local");
    process.exit(1);
  }

  const sqlPath = path.join(
    process.cwd(),
    "src/db/migrations/0000_init_schema_and_rls.sql"
  );
  const migrationSql = readFileSync(sqlPath, "utf8");

  const sql = postgres(databaseUrl, { prepare: false });
  try {
    console.log(
      "Applying Dishionary database schema, triggers, and RLS policies..."
    );
    await sql.unsafe(migrationSql);
    console.log(
      "Successfully applied schema, auth trigger, and RLS policies to Supabase!"
    );
  } finally {
    await sql.end();
  }
}

applyMigrations().catch((err) => {
  console.error("Database migration failed:", err);
  process.exit(1);
});
