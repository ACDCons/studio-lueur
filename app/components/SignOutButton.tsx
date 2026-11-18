"use client";

import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient();

export default function SignOutButton() {
  async function signOut() {
    await authClient.signOut();
    window.location.assign("/connexion");
  }

  return <button type="button" className="button-secondary" onClick={signOut}>Se déconnecter</button>;
}
