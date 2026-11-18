import { createClient } from "@libsql/client/node";
import { drizzle } from "drizzle-orm/libsql/node";
import * as schema from "./schema";
import { getDatabaseConnectionConfig } from "./url";

const client = createClient({
  ...getDatabaseConnectionConfig(process.cwd()),
  concurrency: 1,
});

export const authDb = drizzle({ client, schema });

let foreignKeysReady: Promise<void> | undefined;

export function ensureAuthDatabaseReady(): Promise<void> {
  foreignKeysReady ??= (async () => {
    await client.execute("PRAGMA foreign_keys = ON");
    const result = await client.execute("PRAGMA foreign_keys");
    if (Number(result.rows[0]?.foreign_keys) !== 1) {
      throw new Error("SQLite foreign-key enforcement could not be enabled.");
    }
  })();

  return foreignKeysReady;
}
