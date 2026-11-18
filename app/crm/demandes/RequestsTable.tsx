"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { STATUTS_DEMANDE, TYPES_SEANCE } from "@/src/demandes/constants";
import DeleteDemandeForm from "../components/DeleteDemandeForm";

type Request = {
  id: number;
  contactNom: string;
  contactEmail: string;
  statutContact: string;
  typeSeance: string;
  dateSouhaitee: string | null;
  dateShootingValidee: string | null;
  message: string;
  statut: string;
  budgetEur: number | null;
  createdAt: string;
};

const allStatuses = [...STATUTS_DEMANDE, "Client (historique)"];
const allContactStatuses = ["Lead", "Client", "KO", "HS", "Toxique"];

function CheckboxFilter({
  title,
  values,
  selected,
  onChange,
}: {
  title: string;
  values: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const allSelected = values.length > 0 && selected.length === values.length;
  return <details className="checkbox-filter">
    <summary>{title}<span>{selected.length}/{values.length}</span></summary>
    <div className="checkbox-filter-panel">
      <div className="checkbox-filter-actions">
        <button type="button" onClick={() => onChange(values)}>Tout cocher</button>
        <button type="button" onClick={() => onChange([])}>Tout décocher</button>
      </div>
      <div className="checkbox-filter-options">
        {values.map((value, index) => {
          const checked = selected.includes(value);
          const id = `${title.toLowerCase().replace(/\W+/g, "-")}-${index}`;
          return <label key={value} htmlFor={id}>
            <input id={id} type="checkbox" checked={checked} onChange={() => onChange(checked ? selected.filter((item) => item !== value) : [...selected, value])} />
            <span>{value === "Client (historique)" ? "Client · ancien statut" : value}</span>
          </label>;
        })}
      </div>
      <p className="checkbox-filter-hint">{allSelected ? "Tous les choix sont inclus" : `${selected.length} choix inclus`}</p>
    </div>
  </details>;
}

export default function RequestsTable({ requests }: { requests: Request[] }) {
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(allStatuses);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([...TYPES_SEANCE]);
  const [selectedContactStatuses, setSelectedContactStatuses] = useState<string[]>(allContactStatuses);
  const [dateOrder, setDateOrder] = useState<"none" | "asc" | "desc">("none");
  const filtered = useMemo(() => requests.filter((request) => {
    const haystack = `${request.contactNom} ${request.contactEmail} ${request.message}`.toLocaleLowerCase("fr");
    return (!search || haystack.includes(search.toLocaleLowerCase("fr")))
      && selectedStatuses.includes(request.statut)
      && selectedTypes.includes(request.typeSeance)
      && selectedContactStatuses.includes(request.statutContact);
  }), [requests, search, selectedStatuses, selectedTypes, selectedContactStatuses]);
  const ordered = useMemo(() => {
    if (dateOrder === "none") return filtered;
    return [...filtered].sort((a, b) => {
      if (!a.dateSouhaitee) return b.dateSouhaitee ? 1 : 0;
      if (!b.dateSouhaitee) return -1;
      return dateOrder === "asc"
        ? a.dateSouhaitee.localeCompare(b.dateSouhaitee)
        : b.dateSouhaitee.localeCompare(a.dateSouhaitee);
    });
  }, [filtered, dateOrder]);

  return <section className="requests-panel">
    <div className="filter-row">
      <label className="search-field"><span>⌕</span><input aria-label="Rechercher une demande" placeholder="Rechercher un nom, un e-mail…" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
      <div className="checkbox-filter-row">
        <CheckboxFilter title="Statut demande" values={allStatuses} selected={selectedStatuses} onChange={setSelectedStatuses} />
        <CheckboxFilter title="Type de séance" values={[...TYPES_SEANCE]} selected={selectedTypes} onChange={setSelectedTypes} />
        <CheckboxFilter title="Statut contact" values={allContactStatuses} selected={selectedContactStatuses} onChange={setSelectedContactStatuses} />
      </div>
    </div>
    <div className="results-toolbar"><p className="results-count">{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</p><label className="sort-control">Trier par date souhaitée<select aria-label="Trier par date souhaitée" value={dateOrder} onChange={(event) => setDateOrder(event.target.value as typeof dateOrder)}><option value="none">Ordre reçu</option><option value="asc">Plus proche d’abord</option><option value="desc">Plus éloignée d’abord</option></select></label></div>
    {ordered.length ? <div className="request-table-wrap"><table className="request-table"><thead><tr><th>Contact / projet</th><th>Statut de la demande</th><th>Contact</th><th>Date souhaitée</th><th>Shooting validé</th><th>Budget</th><th /></tr></thead><tbody>
      {ordered.map((request) => <tr key={request.id}><td><div className="table-person"><strong>{request.contactNom}</strong><small>{request.typeSeance} · #{request.id}</small></div></td><td><span className={`status-badge ${request.statut === "Client (historique)" ? "status-muted" : ""}`}>{request.statut === "Client (historique)" ? "Client · historique" : request.statut}</span></td><td><span className="contact-tag">{request.statutContact}</span></td><td>{request.dateSouhaitee || "À définir"}</td><td>{request.dateShootingValidee || "—"}</td><td>{request.budgetEur == null ? "—" : `${request.budgetEur.toLocaleString("fr-FR")} €`}</td><td className="table-actions"><Link className="open-request-button" href={`/crm/${request.id}`}>Ouvrir la fiche <span aria-hidden="true">→</span></Link><DeleteDemandeForm id={request.id} /></td></tr>)}
    </tbody></table></div> : <div className="empty-state"><h2>Aucun résultat</h2><p>Modifiez les filtres ou ajoutez une demande.</p></div>}
  </section>;
}
