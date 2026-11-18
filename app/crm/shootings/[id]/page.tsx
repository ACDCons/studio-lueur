import Link from "next/link";
import { notFound } from "next/navigation";
import { updateShooting } from "@/app/actions/crm";
import { getShooting } from "@/src/crm/queries";
import { STATUTS_SHOOTING } from "@/src/demandes/constants";

export const dynamic = "force-dynamic";

export default async function ShootingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id) || id < 1) notFound();
  const shooting = await getShooting(id);
  if (!shooting) notFound();
  return <div className="detail-page"><Link className="back-to-requests" href="/crm/shootings">← Retour aux shootings</Link>
    <header className="page-header"><div><p className="eyebrow">Shooting</p><h1>{shooting.titre}</h1><p><Link href={`/crm/clients/${shooting.clientId}`}>{shooting.contactNom}</Link> · {shooting.contactEmail}</p></div>{shooting.demandeId && <Link href={`/crm/${shooting.demandeId}`}>Ouvrir la demande →</Link>}</header>
    <section className="detail-card"><div className="panel-heading"><div><p className="eyebrow">Préparation photo</p><h2>Informations du shooting</h2></div></div>
      <form action={updateShooting} className="shooting-edit-form"><input type="hidden" name="shooting_id" value={shooting.id} readOnly />
        <label htmlFor="shooting-title">Intitulé<input id="shooting-title" name="titre" maxLength={120} required defaultValue={shooting.titre} /></label>
        <label htmlFor="shooting-status">État<select id="shooting-status" name="statut" defaultValue={shooting.statut}>{STATUTS_SHOOTING.map((status) => <option key={status}>{status}</option>)}</select></label>
        <label htmlFor="shooting-date">Date de séance<input id="shooting-date" type="date" name="date_seance" defaultValue={shooting.dateSeance ?? ""} /></label>
        <div className="form-two-columns"><label htmlFor="shooting-start">Heure de début<input id="shooting-start" type="time" name="heure_debut" defaultValue={shooting.heureDebut ?? ""} /></label><label htmlFor="shooting-end">Heure de fin<input id="shooting-end" type="time" name="heure_fin" defaultValue={shooting.heureFin ?? ""} /></label></div>
        <label htmlFor="shooting-location">Lieu<input id="shooting-location" name="lieu" maxLength={300} defaultValue={shooting.lieu ?? ""} /></label>
        <label htmlFor="shooting-people">Personnes et moments à photographier<textarea id="shooting-people" name="personnes_et_moments" rows={4} maxLength={3000} defaultValue={shooting.personnesEtMoments ?? ""} /></label>
        <label htmlFor="shooting-organization">Organisation et contraintes<textarea id="shooting-organization" name="organisation" rows={4} maxLength={3000} defaultValue={shooting.organisation ?? ""} /></label>
        <label htmlFor="shooting-deliverables">Livrables prévus<textarea id="shooting-deliverables" name="livrables" rows={3} maxLength={3000} defaultValue={shooting.livrables ?? ""} /></label>
        <button type="submit">Enregistrer le shooting</button>
      </form>
    </section>
  </div>;
}
