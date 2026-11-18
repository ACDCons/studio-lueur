import Link from "next/link";
import SignOutButton from "../components/SignOutButton";

export default function AccessDeniedPage() {
  return (
    <main>
      <section>
        <p className="eyebrow">Accès refusé</p>
        <h1>Cette page est réservée au gestionnaire.</h1>
        <p>Le compte connecté ne dispose pas de ce rôle.</p>
        <SignOutButton />
        <p><Link href="/">Retour au site</Link></p>
      </section>
    </main>
  );
}
