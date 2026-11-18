"use client";

import { createAuthClient } from "better-auth/react";
import { useState, type FormEvent } from "react";

const authClient = createAuthClient();

export default function LoginForm() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setPending(true);

    const form = new FormData(event.currentTarget);
    try {
      const result = await authClient.signIn.email({
        email: String(form.get("email") ?? "").trim(),
        password: String(form.get("password") ?? ""),
        callbackURL: "/crm",
      });

      if (result.error) {
        setMessage("Connexion impossible. Vérifie l’adresse et le mot de passe.");
        return;
      }

      window.location.assign("/crm");
    } catch {
      setMessage("Le service de connexion est indisponible pour le moment.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={signIn}>
      <label htmlFor="login-email">E-mail
        <input id="login-email" name="email" type="email" autoComplete="username" required maxLength={254} />
      </label>
      <label htmlFor="login-password">Mot de passe
        <input id="login-password" name="password" type="password" autoComplete="current-password" required />
      </label>
      <button type="submit" disabled={pending}>{pending ? "Connexion…" : "Se connecter"}</button>
      {message && <p className="form-error" role="alert">{message}</p>}
    </form>
  );
}
