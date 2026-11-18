import Link from "next/link";
import { listClients } from "@/src/crm/queries";
import NewDemandeForm from "../components/NewDemandeForm";

export default async function NouvelleDemandePage({ searchParams }: { searchParams: Promise<{ clientId?: string }> }) {
  const [{ clientId }, clients] = await Promise.all([searchParams, listClients()]);
  return <div className="new-request-page">
    <header className="page-header"><div><p className="eyebrow">CRM · ajout manuel</p><h1>Nouvelle demande</h1><p>Pour un projet reçu par téléphone ou en personne.</p></div><Link href="/crm/demandes">← Retour aux demandes</Link></header>
    <section className="detail-card"><NewDemandeForm clients={clients} defaultClientId={clientId} /></section>
  </div>;
}
