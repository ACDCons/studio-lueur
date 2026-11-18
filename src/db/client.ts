import { createClient } from "@libsql/client/node";
import { drizzle } from "drizzle-orm/libsql/node";
import * as schema from "./schema";
import { resolveDatabaseUrl } from "./url";

export async function openDatabase() {
  const client = createClient({
    url: resolveDatabaseUrl(process.env.DATABASE_URL, process.cwd()),
    concurrency: 1,
  });

  try {
    await client.execute("PRAGMA foreign_keys = ON");
    const result = await client.execute("PRAGMA foreign_keys");
    if (Number(result.rows[0]?.foreign_keys) !== 1) {
      throw new Error("SQLite foreign-key enforcement could not be enabled.");
    }

    return { client, db: drizzle({ client, schema }) };
  } catch (error) {
    await client.close();
    throw error;
  }
}
