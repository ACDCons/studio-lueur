import DemandeForm from "./DemandeForm";

export default function Home() {
  return (
    <main>
      <section>
        <p className="eyebrow">Studio Lueur · projet fictif</p>
        <h1>Vos moments,<br />dans la bonne lumière.</h1>
        <p>Nora photographie les mariages, les portraits et les événements d’entreprise.</p>
        <a className="button" href="#demande">Demander une séance</a>
      </section>
      <section>
        <h2>Trois types de séances</h2>
        <div className="grid">
          <div className="card"><h3>Mariages</h3><p>Le jour J, raconté en images.</p></div>
          <div className="card"><h3>Portraits</h3><p>Une séance pour vous, à votre rythme.</p></div>
          <div className="card"><h3>Entreprises</h3><p>Vos équipes et vos événements.</p></div>
        </div>
      </section>
      <section>
        <h2>Comment ça se passe ?</h2>
        <ol>
          <li>Vous décrivez votre projet de séance.</li>
          <li>Nora vous recontacte pour en parler.</li>
          <li>Ensemble, vous fixez les détails.</li>
        </ol>
        <p className="demo-note">Tarifs et disponibilités : à confirmer avec Nora.</p>
      </section>
      <section id="demande">
        <h2>Demander une séance</h2>
        <DemandeForm />
      </section>
    </main>
  );
}
