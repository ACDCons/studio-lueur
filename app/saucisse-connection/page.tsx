import Link from "next/link";
import LoginForm from "../components/LoginForm";

export default function SaucisseConnexionPage() {
  return <main className="login-page">
    <Link className="login-back" href="/">← Retour au site</Link>
    <section className="login-card">
      <div className="login-brand"><span className="brand-mark">SL</span><span>Studio Lueur<small>ESPACE PRIVÉ</small></span></div>
      <p className="eyebrow">Accès gestionnaire</p>
      <h1>Ravie de vous revoir.</h1>
      <p className="login-intro">Connectez-vous pour retrouver les projets du studio.</p>
      <LoginForm />
      <p className="login-footnote">Connexion privée · compte créé localement par l’administration.</p>
    </section>
  </main>;
}
