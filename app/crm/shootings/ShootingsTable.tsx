"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { STATUTS_SHOOTING } from "@/src/demandes/constants";

type Shooting = { id: number; titre: string; demandeId: number | null; clientId: number; contactNom: string; contactEmail: string; statut: string; dateSeance: string | null; heureDebut: string | null; lieu: string | null; organisation: string | null };

export default function ShootingsTable({ shootings }: { shootings: Shooting[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Tous");
  const [relation, setRelation] = useState("Tous");
  const [order, setOrder] = useState("date-asc");
  const rows = useMemo(() => {
    const filtered = shootings.filter((shooting) => `${shooting.titre} ${shooting.contactNom} ${shooting.contactEmail} ${shooting.lieu ?? ""}`.toLocaleLowerCase("fr").includes(search.toLocaleLowerCase("fr")) && (status === "Tous" || shooting.statut === status) && (relation === "Tous" || (relation === "Avec demande" ? shooting.demandeId !== null : shooting.demandeId === null)));
    return filtered.sort((a, b) => {
      if (!a.dateSeance) return b.dateSeance ? 1 : 0;
      if (!b.dateSeance) return -1;
      const aDate = a.dateSeance;
      const bDate = b.dateSeance;
      return order === "date-desc" ? bDate.localeCompare(aDate) : aDate.localeCompare(bDate);
    });
  }, [shootings, search, status, relation, order]);
  return <section className="requests-panel"><div className="filter-row shooting-filters">
    <label className="search-field"><span>⌕</span><input aria-label="Rechercher un shooting" placeholder="Nom, e-mail, lieu…" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
    <label className="sort-control">État<select value={status} onChange={(event) => setStatus(event.target.value)}><option>Tous</option>{STATUTS_SHOOTING.map((item) => <option key={item}>{item}</option>)}</select></label>
    <label className="sort-control">Origine<select value={relation} onChange={(event) => setRelation(event.target.value)}><option>Tous</option><option>Avec demande</option><option>Sans demande</option></select></label>
    <label className="sort-control">Trier par date<select value={order} onChange={(event) => setOrder(event.target.value)}><option value="date-asc">Plus proche d’abord</option><option value="date-desc">Plus éloignée d’abord</option></select></label>
  </div><p className="results-count">{rows.length} résultat{rows.length > 1 ? "s" : ""}</p>
  {rows.length ? <div className="request-table-wrap"><table className="request-table"><thead><tr><th>Client / shooting</th><th>État</th><th>Date</th><th>Heure</th><th>Lieu</th><th /></tr></thead><tbody>{rows.map((shooting) => <tr key={shooting.id}><td><div className="table-person"><strong>{shooting.contactNom}</strong><small>{shooting.titre} · {shooting.demandeId ? `demande #${shooting.demandeId}` : "créé manuellement"}</small></div></td><td><span className="status-badge">{shooting.statut}</span></td><td>{shooting.dateSeance || "À organiser"}</td><td>{shooting.heureDebut || "—"}</td><td>{shooting.lieu || "À définir"}</td><td><Link className="open-request-button" href={`/crm/shootings/${shooting.id}`}>Ouvrir <span aria-hidden="true">→</span></Link></td></tr>)}</tbody></table></div> : <div className="empty-state"><h2>Aucun résultat</h2><p>Les shootings apparaissent au paiement d’une facture d’acompte ou peuvent être créés depuis une fiche client.</p></div>}
  </section>;
}
