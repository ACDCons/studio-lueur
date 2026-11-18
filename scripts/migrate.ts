import path from "node:path";
import { migrate } from "drizzle-orm/libsql/migrator";
import { openDatabase } from "../src/db/client";

async function main() {
  const { client, db } = await openDatabase();

  try {
    await migrate(db, { migrationsFolder: path.resolve(process.cwd(), "drizzle") });
    console.log("Drizzle migrations applied.");
  } finally {
    await client.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
