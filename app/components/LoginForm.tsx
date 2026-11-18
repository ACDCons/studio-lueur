"use client";

import { createAuthClient } from "better-auth/react";
import { useState, type FormEvent } from "react";

const authClient = createAuthClient();

export default function LoginForm() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLength, setPasswordLength] = useState(0);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setPending(true);

    const form = new FormData(event.currentTarget);
    try {
      const result = await authClient.signIn.email({
        email: (() => {
          const identity = String(form.get("identity") ?? "").trim();
          return identity.toLocaleLowerCase("fr") === "antho" ? "achard.consulting@gmail.com" : identity;
        })(),
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
      <label htmlFor="login-identity">Utilisateur
        <input id="login-identity" name="identity" type="text" autoComplete="username" placeholder="Antho" required maxLength={254} />
      </label>
      <label htmlFor="login-password">Mot de passe
        <span className="password-field">
          <input id="login-password" className={!showPassword ? "sausage-password" : ""} name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required onChange={(event) => setPasswordLength(event.target.value.length)} />
          {!showPassword && passwordLength > 0 && <span className="sausage-mask" aria-hidden="true">{"🌭".repeat(passwordLength)}</span>}
          <button className="password-toggle" type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={showPassword}>{showPassword ? "🙈" : "👁️"}</button>
        </span>
      </label>
      <button type="submit" disabled={pending}>{pending ? "Connexion…" : "Se connecter"}</button>
      {message && <p className="form-error" role="alert">{message}</p>}
    </form>
  );
}
