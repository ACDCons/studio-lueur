import Link from "next/link";
import LoginForm from "../components/LoginForm";

export default function ConnexionPage() {
  return (
    <main>
      <section>
        <p className="eyebrow">Espace gestionnaire</p>
        <h1>Connexion</h1>
        <p>La création de comptes est réservée à l’opération locale d’administration.</p>
        <LoginForm />
        <p><Link href="/">Retour au site</Link></p>
      </section>
    </main>
  );
}
