import Link from "next/link";
import { listClients } from "@/src/crm/queries";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await listClients();
  return <div className="requests-page">
    <header className="page-header"><div><p className="eyebrow">CRM · {clients.length} clients</p><h1>Clients</h1><p>Les clients sont créés au paiement d’une facture d’acompte.</p></div><Link className="button" href="/crm/demandes">Toutes les demandes</Link></header>
    <section className="requests-panel"><div className="client-list">
      {clients.length ? clients.map((client) => <Link className="client-row" key={client.id} href={`/crm/clients/${client.id}`}><span className="recent-avatar">{client.nom.slice(0, 1).toUpperCase()}</span><span className="recent-name"><strong>{client.nom}</strong><small>{client.email}</small></span><span className="muted-text">Client depuis {client.createdAt.slice(0, 10)}</span><span className="row-arrow">→</span></Link>) : <div className="empty-state"><h2>Aucun client pour le moment</h2><p>Une facture d’acompte passée à « Payée » crée le client correspondant.</p></div>}
    </div></section>
  </div>;
}
