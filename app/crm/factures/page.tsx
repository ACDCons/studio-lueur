import Link from "next/link";
import { listFactures } from "@/src/crm/queries";
import InvoicesTable from "./InvoicesTable";

export const dynamic = "force-dynamic";

export default async function FacturesPage() {
  const invoices = await listFactures();
  return <div className="requests-page"><header className="page-header"><div><p className="eyebrow">CRM · {invoices.length} factures</p><h1>Factures</h1><p>Suivi manuel des factures envoyées, acomptes et soldes.</p></div><Link className="button" href="/crm/demandes">Créer depuis une demande</Link></header><InvoicesTable invoices={invoices} /></div>;
}
