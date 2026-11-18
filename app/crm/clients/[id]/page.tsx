import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient } from "@/src/crm/queries";
import { createFactureForClient, createShootingForClient } from "@/app/actions/crm";
import { STATUTS_SHOOTING, TYPES_FACTURE } from "@/src/demandes/constants";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ shooting?: string; facture?: string }> }) {
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id) || id < 1) notFound();
  const [client, query] = await Promise.all([getClient(id), searchParams]);
  if (!client) notFound();
  return <div className="detail-page">
    <Link className="back-to-requests" href="/crm/clients"><span aria-hidden="true">←</span> Retour aux clients</Link>
    <header className="page-header"><div><p className="eyebrow">Fiche client</p><h1>{client.nom}</h1><a href={`mailto:${client.email}`}>{client.email}</a></div><Link className="button" href={`/crm/nouvelle?clientId=${client.id}`}>＋ Créer une demande</Link></header>
    <section className="detail-card"><p className="eyebrow">Demandes · {client.demandes.length}</p>
      {client.demandes.length ? <div className="request-table-wrap"><table className="request-table"><thead><tr><th>Projet</th><th>Statut de demande</th><th>Date souhaitée</th><th>Budget indicatif</th><th /></tr></thead><tbody>{client.demandes.map((request) => <tr key={request.id}><td>{request.typeSeance} · #{request.id}</td><td>{request.statut}</td><td>{request.dateSouhaitee || "À définir"}</td><td>{request.budgetEur == null ? "—" : `${request.budgetEur.toLocaleString("fr-FR")} €`}</td><td><Link className="open-request-button" href={`/crm/${request.id}`}>Ouvrir →</Link></td></tr>)}</tbody></table></div> : <div className="empty-state"><h2>Aucune demande associée</h2><p>Crée une demande pour ce client ou attribue-lui une demande existante.</p></div>}
    </section>
    <section className="detail-card"><div className="panel-heading"><div><p className="eyebrow">Shootings · {client.shootings.length}</p><h2>Projets photo</h2></div></div>
      {query.shooting && <p className="form-error" role="alert">Le shooting n’a pas été créé. Vérifie les champs et l’éventuelle demande liée.</p>}
      {client.shootings.length ? <div className="related-record-list">{client.shootings.map((shooting) => <article className="related-record" key={shooting.id}><div><Link href={`/crm/shootings/${shooting.id}`}><strong>{shooting.titre}</strong></Link><small>{shooting.statut} · {shooting.dateSeance || "Date à organiser"}{shooting.demandeId ? ` · demande #${shooting.demandeId}` : " · sans demande"}</small></div><span>{shooting.lieu || "Lieu à définir"}</span></article>)}</div> : <p className="muted-text">Aucun shooting associé.</p>}
      <details className="client-create-panel"><summary>＋ Créer un shooting</summary><form action={createShootingForClient} className="shooting-edit-form"><input type="hidden" name="client_id" value={client.id} readOnly />
        <label>Intitulé<input name="titre" maxLength={120} required /></label>
        <label>Demande liée (facultatif)<select name="demande_id" defaultValue=""><option value="">Aucune demande</option>{client.demandes.map((request) => <option key={request.id} value={request.id}>{request.typeSeance} · demande #{request.id}</option>)}</select></label>
        <label>État<select name="statut" defaultValue="À organiser">{STATUTS_SHOOTING.map((status) => <option key={status}>{status}</option>)}</select></label>
        <label>Date<input type="date" name="date_seance" /></label><div className="form-two-columns"><label>Heure de début<input type="time" name="heure_debut" /></label><label>Heure de fin<input type="time" name="heure_fin" /></label></div>
        <label>Lieu<input name="lieu" maxLength={300} /></label><label>Personnes et moments à photographier<textarea name="personnes_et_moments" rows={3} maxLength={3000} /></label><label>Organisation et contraintes<textarea name="organisation" rows={3} maxLength={3000} /></label><label>Livrables prévus<textarea name="livrables" rows={3} maxLength={3000} /></label>
        <button type="submit">Créer le shooting</button>
      </form></details>
    </section>
    <section className="detail-card"><div className="panel-heading"><div><p className="eyebrow">Factures · {client.factures.length}</p><h2>Facturation</h2></div></div>
      {query.facture && <p className="form-error" role="alert">La facture n’a pas été créée. Vérifie les champs et l’éventuelle demande liée.</p>}
      {client.factures.length ? <div className="related-record-list">{client.factures.map((invoice) => <article className="related-record" key={invoice.id}><div><strong>{invoice.type}</strong><small>{invoice.statut}{invoice.demandeId ? ` · demande #${invoice.demandeId}` : " · facture client"}</small></div><span>{(invoice.montantCentimes / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span></article>)}</div> : <p className="muted-text">Aucune facture rattachée au client.</p>}
      <details className="client-create-panel"><summary>＋ Créer une facture</summary><form action={createFactureForClient} className="compact-form"><input type="hidden" name="client_id" value={client.id} readOnly />
        <label>Demande liée (facultatif)<select name="demande_id" defaultValue=""><option value="">Aucune demande</option>{client.demandes.map((request) => <option key={request.id} value={request.id}>{request.typeSeance} · demande #{request.id}</option>)}</select></label>
        <label>Type<select name="type">{TYPES_FACTURE.map((type) => <option key={type}>{type}</option>)}</select></label><label>Montant (€)<input name="montant_eur" type="number" min="0.01" step="0.01" required /></label><button type="submit">Enregistrer une facture envoyée</button>
      </form></details>
    </section>
  </div>;
}
