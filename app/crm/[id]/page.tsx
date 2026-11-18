import Link from "next/link";
import { notFound } from "next/navigation";
import { getDemande } from "@/src/demandes/queries";
import { STATUTS_CONTACT } from "@/src/demandes/constants";
import { updateContactStatus } from "@/app/actions/demandes";
import EditDemandeForm from "../components/EditDemandeForm";
import DeleteDemandeForm from "../components/DeleteDemandeForm";
import ExchangeForm from "../components/ExchangeForm";
import { assignDemandeClient, createFacture } from "@/app/actions/crm";
import { getFacturesForDemande, listClients } from "@/src/crm/queries";

export const dynamic = "force-dynamic";

export default async function DetailDemandePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ client?: string; suppression?: string }> }) {
  const [{ id: rawId }, query] = await Promise.all([params, searchParams]);
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id < 1) notFound();
  const [request, invoices, clients] = await Promise.all([getDemande(id), getFacturesForDemande(id), listClients()]);
  if (!request) notFound();

  return <div className="detail-page">
    <Link className="back-to-requests" href="/crm/demandes"><span aria-hidden="true">←</span> Retour aux demandes</Link>
    {query.suppression === "liee" && <p className="form-error" role="alert">Cette demande a une facture ou un shooting associé. Son historique est conservé et empêche sa suppression.</p>}
    <header className="detail-header"><div><p className="eyebrow">Fiche projet · demande #{request.id}</p><h1>{request.contactNom}</h1><a href={`mailto:${request.contactEmail}`}>{request.contactEmail}</a></div><span className="status-badge">{request.statut === "Client (historique)" ? "Client · historique" : request.statut}</span></header>
    <div className="detail-grid">
      <div className="detail-main-column">
        <section className="detail-card"><div className="panel-heading"><div><p className="eyebrow">Le projet</p><h2>{request.typeSeance}</h2></div><span className="contact-tag">{request.dateSouhaitee || "Date à définir"}</span></div>
          <p className="detail-message">{request.message}</p>
          <dl className="detail-meta"><div><dt>Reçue le</dt><dd>{request.createdAt}</dd></div><div><dt>Date souhaitée</dt><dd>{request.dateSouhaitee || "Non précisée"}</dd></div><div><dt>Shooting validé</dt><dd>{request.dateShootingValidee || "À confirmer"}</dd></div><div><dt>Budget client</dt><dd>{request.budgetEur == null ? "À renseigner" : `${request.budgetEur.toLocaleString("fr-FR")} €`}</dd></div>{request.raisonRefus && <div><dt>Motif du refus</dt><dd>{request.raisonRefus}</dd></div>}</dl>
          {request.note && <p><strong>Note :</strong> {request.note}</p>}{request.prochaineAction && <p><strong>Prochaine action :</strong> {request.prochaineAction}</p>}
        </section>
        <section className="detail-card"><div className="panel-heading"><div><p className="eyebrow">Suivi</p><h2>Modifier le projet</h2></div></div>
          <EditDemandeForm initialValues={{ id: String(request.id), type_seance: request.typeSeance, date_souhaitee: request.dateSouhaitee ?? "", date_shooting_validee: request.dateShootingValidee ?? "", message: request.message, statut: request.statut, raison_refus: request.raisonRefus ?? "", budget_eur: request.budgetEur == null ? "" : String(request.budgetEur), note: request.note ?? "", prochaine_action: request.prochaineAction ?? "" }} />
        </section>
        <section className="detail-card"><div className="panel-heading"><div><p className="eyebrow">Facturation</p><h2>Factures liées</h2></div></div>
          {invoices.length ? <div className="invoice-mini-list">{invoices.map((invoice) => <p key={invoice.id}><strong>{invoice.type}</strong> · {(invoice.montantCentimes / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })} · {invoice.statut}</p>)}</div> : <p className="muted-text">Aucune facture enregistrée.</p>}
          <form action={createFacture} className="compact-form"><input type="hidden" name="demande_id" value={request.id} readOnly /><label htmlFor="invoice-type">Type<select id="invoice-type" name="type"><option value="Acompte">Acompte</option><option value="Solde">Solde</option></select></label><label htmlFor="invoice-amount">Montant (€)<input id="invoice-amount" name="montant_eur" type="number" min="0.01" step="0.01" required /></label><button type="submit">Enregistrer une facture envoyée</button></form>
        </section>
        <section className="detail-card"><div className="panel-heading"><div><p className="eyebrow">Journal de contact</p><h2>Échanges</h2></div><span>{request.echanges.length} entrée{request.echanges.length > 1 ? "s" : ""}</span></div>
          {request.echanges.length ? <ol className="exchange-list">{request.echanges.map((entry) => <li key={entry.id}><span className="exchange-marker" /><div><p><strong>{entry.auteur}</strong><time>{entry.createdAt}</time></p><div className="exchange-content">{entry.contenu}</div></div></li>)}</ol> : <p className="muted-text">Aucun échange enregistré pour le moment.</p>}
          <ExchangeForm requestId={request.id} />
        </section>
      </div>
      <aside className="detail-side-column">
        <section className="detail-card"><p className="eyebrow">Client</p>
          {query.client === "verrouille" && <p className="form-error" role="alert">Cette demande ne peut plus changer de client, car une facture ou un shooting y est déjà lié.</p>}
          {query.client === "attribue" && <p className="demo-note" role="status">La demande a été rattachée au client.</p>}
          {clients.some((client) => client.contactId === request.contactId) ? <><p>Cette demande est rattachée à un client.</p><Link href={`/crm/clients/${clients.find((client) => client.contactId === request.contactId)?.id}`}>Ouvrir sa fiche client →</Link></> : clients.length ? <form action={assignDemandeClient} className="compact-form"><input type="hidden" name="demande_id" value={request.id} readOnly /><label htmlFor="assign-client">Attribuer à un client<select id="assign-client" name="client_id" required defaultValue=""><option value="" disabled>Choisir…</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.nom} · {client.email}</option>)}</select></label><button type="submit">Attribuer</button></form> : <p className="muted-text">Aucun client enregistré pour le moment. Le client sera créé lors du paiement d’une facture d’acompte.</p>}
        </section>
        <section className="detail-card contact-card"><p className="eyebrow">Contact associé</p><h2>{request.contactNom}</h2><a href={`mailto:${request.contactEmail}`}>{request.contactEmail}</a>
          {request.clientId ? <p className="muted-text">Client · aucune fiche de statut supplémentaire</p> : <><p className="contact-tag">Statut du prospect : {request.statutContact}</p><form action={updateContactStatus} className="contact-status-form"><input type="hidden" name="contact_id" value={request.contactId} readOnly /><label htmlFor="contact-status">Modifier le statut du prospect<select id="contact-status" name="statut_contact" defaultValue={request.statutContact ?? "Lead"}>{STATUTS_CONTACT.map((status) => <option key={status}>{status}</option>)}</select></label><button type="submit" className="button-secondary">Mettre à jour</button></form></>}
        </section>
        <section className="detail-card"><p className="eyebrow">Repères</p><dl className="detail-meta"><div><dt>Type de séance</dt><dd>{request.typeSeance}</dd></div><div><dt>Date souhaitée</dt><dd>{request.dateSouhaitee || "Non précisée"}</dd></div><div><dt>Date validée</dt><dd>{request.dateShootingValidee || "À confirmer"}</dd></div><div><dt>État du projet</dt><dd>{request.statut}</dd></div></dl></section>
        <section className="detail-card delete-section"><p className="eyebrow">Zone sensible</p><h2>Supprimer la demande</h2><p>Cette action ne supprime pas le contact ni ses autres demandes.</p><DeleteDemandeForm id={request.id} /></section>
      </aside>
    </div>
  </div>;
}
