import Link from "next/link";
import { listDemandes } from "@/src/demandes/queries";
import RequestsTable from "./RequestsTable";

export const dynamic = "force-dynamic";

export default async function DemandesPage() {
  const requests = await listDemandes();
  return <div className="requests-page">
    <header className="page-header"><div><p className="eyebrow">CRM · {requests.length} demandes</p><h1>Toutes les demandes</h1><p>Retrouvez les projets et leur suivi au même endroit.</p></div><Link className="button" href="/crm/nouvelle">＋ Ajouter une demande</Link></header>
    <RequestsTable requests={requests} />
  </div>;
}
