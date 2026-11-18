import { spawnSync } from "node:child_process";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { loadEnvConfig } from "@next/env";

const role = process.argv[2];
if (role !== "manager" && role !== "user") {
  throw new Error("Use the npm auth:create-manager or auth:create-user command.");
}

const suppliedArgs = process.argv.slice(3);
const identity: { email?: string; name?: string } = {};
for (let index = 0; index < suppliedArgs.length; index += 1) {
  const option = suppliedArgs[index];
  if (option === "--email" || option === "--name") {
    const value = suppliedArgs[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`A value is required for ${option}.`);
    identity[option.slice(2) as "email" | "name"] = value;
    index += 1;
    continue;
  }
  if (/^(--password|--role|--force|--yes)(=|$)/i.test(option)) {
    throw new Error("Do not pass passwords or role overrides as command-line arguments.");
  }
  throw new Error(`Unsupported option: ${option}`);
}

loadEnvConfig(process.cwd());
if ((process.env.BETTER_AUTH_SECRET?.trim().length ?? 0) < 32) {
  throw new Error("Set BETTER_AUTH_SECRET locally to a value of at least 32 characters before creating accounts.");
}

const prompt = createInterface({ input: stdin, output: stdout });
try {
  identity.email ??= (await prompt.question("Adresse e-mail du compte : ")).trim();
  identity.name ??= (await prompt.question("Nom du compte : ")).trim();
} finally {
  prompt.close();
}
if (!identity.email || !identity.name) throw new Error("An email and a name are required.");

const cliPath = path.resolve(process.cwd(), "node_modules/auth/dist/index.mjs");
const args = [
  cliPath,
  "create-admin",
  "--config",
  "src/auth.ts",
  "--role",
  role === "manager" ? "admin" : "user",
  "--email",
  identity.email,
  "--name",
  identity.name,
];

if (role === "user") args.push("--force");

const result = spawnSync(process.execPath, args, {
  cwd: process.cwd(),
  env: process.env,
  stdio: "inherit",
});

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
