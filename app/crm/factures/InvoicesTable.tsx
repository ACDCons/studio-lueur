"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { updateFactureStatus } from "@/app/actions/crm";
import { ETATS_FACTURE, TYPES_FACTURE } from "@/src/demandes/constants";

type Invoice = { id: number; clientId: number | null; demandeId: number | null; contactNom: string; contactEmail: string; typeSeance: string | null; type: string; statut: string; montantCentimes: number; dateEmission: string; datePaiement: string | null };

export default function InvoicesTable({ invoices }: { invoices: Invoice[] }) {
  const [status, setStatus] = useState("Tous");
  const [type, setType] = useState("Tous");
  const [search, setSearch] = useState("");
  const rows = useMemo(() => invoices.filter((invoice) => (status === "Tous" || invoice.statut === status) && (type === "Tous" || invoice.type === type) && `${invoice.contactNom} ${invoice.contactEmail}`.toLocaleLowerCase("fr").includes(search.toLocaleLowerCase("fr"))), [invoices, status, type, search]);
  return <section className="requests-panel"><div className="filter-row invoice-filters">
    <label className="search-field"><span>⌕</span><input aria-label="Rechercher une facture" placeholder="Nom, e-mail…" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
    <label className="sort-control">Type<select value={type} onChange={(event) => setType(event.target.value)}><option>Tous</option>{TYPES_FACTURE.map((item) => <option key={item}>{item}</option>)}</select></label>
    <label className="sort-control">État<select value={status} onChange={(event) => setStatus(event.target.value)}><option>Tous</option>{ETATS_FACTURE.map((item) => <option key={item}>{item}</option>)}</select></label>
  </div><p className="results-count">{rows.length} facture{rows.length > 1 ? "s" : ""}</p>
  {rows.length ? <div className="request-table-wrap"><table className="request-table"><thead><tr><th>Client / demande</th><th>Type</th><th>Montant</th><th>Émise le</th><th>État</th><th>Modifier l’état</th></tr></thead><tbody>{rows.map((invoice) => <tr key={invoice.id}><td><Link href={invoice.clientId ? `/crm/clients/${invoice.clientId}` : invoice.demandeId ? `/crm/${invoice.demandeId}` : "/crm/factures"} className="table-person"><strong>{invoice.contactNom}</strong><small>{invoice.demandeId ? `${invoice.typeSeance ?? "Demande"} · demande #${invoice.demandeId}` : "Facture créée depuis la fiche client"}</small></Link></td><td>{invoice.type}</td><td>{(invoice.montantCentimes / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</td><td>{invoice.dateEmission.slice(0, 10)}</td><td><span className="status-badge">{invoice.statut}</span>{invoice.datePaiement && <small className="table-subline">Payée le {invoice.datePaiement.slice(0, 10)}</small>}</td><td><form action={updateFactureStatus} className="inline-status-form"><input type="hidden" name="facture_id" value={invoice.id} readOnly /><select name="statut" aria-label={`Nouvel état de la facture ${invoice.id}`} defaultValue={invoice.statut}>{ETATS_FACTURE.map((item) => <option key={item}>{item}</option>)}</select><button type="submit">Enregistrer</button></form></td></tr>)}</tbody></table></div> : <div className="empty-state"><h2>Aucune facture correspondante</h2><p>Crée une facture envoyée depuis la fiche d’une demande ou d’un client.</p></div>}
  </section>;
}
