import Link from "next/link";
import { listDemandes } from "@/src/demandes/queries";
import DeleteDemandeForm from "./components/DeleteDemandeForm";
import SignOutButton from "../components/SignOutButton";
import { requireManager } from "@/src/auth/server";

export const dynamic = "force-dynamic";

export default async function CrmPage() {
  const session = await requireManager();
  const demandes = await listDemandes();

  return (
    <main>
      <section>
        <p className="eyebrow">Espace de suivi local</p>
        <h1>Demandes reçues</h1>
        <p>Cette version d’exercice utilise uniquement la base locale et des données fictives.</p>
        <div className="crm-toolbar">
          <Link className="button" href="/crm/nouvelle">Ajouter une demande</Link>
          <Link href="/">Retour au site</Link>
          <span>Connecté : {session.user.name}</span>
          <SignOutButton />
        </div>
      </section>

      <section>
        {demandes.length === 0 ? (
          <div className="empty-state">
            <h2>Aucune demande pour le moment</h2>
            <p>Les demandes envoyées depuis le formulaire apparaîtront ici.</p>
          </div>
        ) : (
          <div className="request-list">
            {demandes.map((demande) => (
              <article className="request-card" key={demande.id}>
                <div className="request-card-heading">
                  <div>
                    <p className="eyebrow">Demande #{demande.id}</p>
                    <h2>{demande.contactNom}</h2>
                    <p><a href={`mailto:${demande.contactEmail}`}>{demande.contactEmail}</a></p>
                  </div>
                  <span className="status-badge">{demande.statut}</span>
                </div>
                <dl className="request-summary">
                  <div><dt>Type</dt><dd>{demande.typeSeance}</dd></div>
                  <div><dt>Date souhaitée</dt><dd>{demande.dateSouhaitee || "Non précisée"}</dd></div>
                  <div><dt>Reçue le</dt><dd>{demande.createdAt}</dd></div>
                </dl>
                <p className="request-message">{demande.message}</p>
                {demande.note && <p><strong>Note :</strong> {demande.note}</p>}
                {demande.prochaineAction && <p><strong>Prochaine action :</strong> {demande.prochaineAction}</p>}
                <div className="request-actions">
                  <Link className="button" href={`/crm/${demande.id}`}>Ouvrir et modifier</Link>
                  <DeleteDemandeForm id={demande.id} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
