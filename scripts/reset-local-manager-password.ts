import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { loadEnvConfig } from "@next/env";

function askPasswordHidden(promptText: string): Promise<string> {
  if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
    throw new Error("Run this command in an interactive terminal so the password can stay hidden.");
  }

  stdout.write(promptText);
  stdin.setRawMode(true);
  stdin.resume();

  return new Promise((resolve, reject) => {
    let password = "";
    const finish = (error?: Error) => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("data", onData);
      stdout.write("\n");
      if (error) reject(error);
      else resolve(password);
    };
    const onData = (chunk: Buffer) => {
      for (const character of chunk.toString("utf8")) {
        if (character === "\u0003") {
          finish(new Error("Password reset cancelled."));
          return;
        }
        if (character === "\r" || character === "\n") {
          finish();
          return;
        }
        if (character === "\u007f" || character === "\b") {
          password = Array.from(password).slice(0, -1).join("");
          continue;
        }
        if (character >= " ") password += character;
      }
    };
    stdin.on("data", onData);
  });
}

async function main() {
  loadEnvConfig(process.cwd(), true);
  if ((process.env.BETTER_AUTH_SECRET?.trim().length ?? 0) < 32) {
    throw new Error("Set a stable local BETTER_AUTH_SECRET of at least 32 characters before resetting a password.");
  }

  const prompt = createInterface({ input: stdin, output: stdout });
  let email: string;
  try {
    email = (await prompt.question("Adresse e-mail du compte gestionnaire : ")).trim();
  } finally {
    prompt.close();
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid account e-mail address.");
  }

  const password = await askPasswordHidden("Nouveau mot de passe : ");
  if (password.length < 8 || password.length > 128) {
    throw new Error("Use a new password between 8 and 128 characters.");
  }

  const { auth } = await import("../src/auth");
  const context = await auth.$context;
  const managerResult = await context.internalAdapter.findUserByEmail(email);
  const manager = managerResult?.user;
  const managerRole = manager && "role" in manager ? manager.role : undefined;
  if (!manager || managerRole !== "admin") {
    throw new Error("No manager account was found for that e-mail address.");
  }
  if (!(await context.internalAdapter.findCredentialAccount(manager.id))) {
    throw new Error("The manager account has no email/password credential to reset.");
  }

  const passwordHash = await context.password.hash(password);
  await context.internalAdapter.updatePassword(manager.id, passwordHash);
  await context.internalAdapter.deleteUserSessions(manager.id);
  console.log("Manager password updated. Existing sessions were revoked.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
