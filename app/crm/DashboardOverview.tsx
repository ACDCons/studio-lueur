"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { STATUTS_DEMANDE, TYPES_SEANCE } from "@/src/demandes/constants";

type Request = {
  id: number;
  contactNom: string;
  typeSeance: string;
  dateSouhaitee: string | null;
  statut: string;
  budgetEur: number | null;
  createdAt: string;
};

const budgetDemo = [
  { label: "< 500 €", count: 3 },
  { label: "500–999 €", count: 6 },
  { label: "1 000–1 999 €", count: 5 },
  { label: "2 000 € +", count: 2 },
];

export default function DashboardOverview({ requests }: { requests: Request[] }) {
  const [days, setDays] = useState(30);
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const recentCount = requests.filter((request) => new Date(request.createdAt).getTime() >= cutoff).length;
  const openCount = requests.filter((request) => !["Livrée", "Payée", "Refusée", "Annulée", "Client (historique)"].includes(request.statut)).length;
  const byType = TYPES_SEANCE.map((type) => ({
    label: type,
    count: requests.filter((request) => request.typeSeance === type).length,
  }));
  const byStatus = STATUTS_DEMANDE.map((status) => ({
    label: status,
    count: requests.filter((request) => request.statut === status).length,
  }));
  const recent = useMemo(() => requests.slice(0, 5), [requests]);
  const maxType = Math.max(...byType.map((entry) => entry.count), 1);
  const maxBudget = Math.max(...budgetDemo.map((entry) => entry.count), 1);

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div><p className="eyebrow">Studio Lueur · espace de suivi</p><h1>Bonjour, Nora <span>✦</span></h1><p>Voici ce qui se passe au studio.</p></div>
        <Link className="button" href="/crm/nouvelle">＋ Ajouter une demande</Link>
      </header>

      <section className="metric-grid" aria-label="Indicateurs clés">
        <article className="metric-card metric-highlight"><span>Demandes en cours</span><strong>{openCount}</strong><small>Tous statuts actifs confondus</small></article>
        <article className="metric-card"><span>Demandes au total</span><strong>{requests.length}</strong><small>Dans la base locale fictive</small></article>
        <article className="metric-card"><span>Nouvelles demandes</span><strong>{recentCount}</strong><label className="period-select">sur <select value={days} onChange={(event) => setDays(Number(event.target.value))}><option value={7}>7 jours</option><option value={30}>30 jours</option><option value={90}>90 jours</option></select></label></article>
      </section>

      <section className="dashboard-panel">
        <div className="panel-heading"><div><p className="eyebrow">Pipeline</p><h2>Demandes par statut</h2></div><Link href="/crm/demandes">Voir toutes les demandes →</Link></div>
        <div className="status-grid">
          {byStatus.map((item, index) => <div className="status-tile" key={item.label}><span className={`status-dot dot-${index % 6}`} /><span>{item.label}</span><strong>{item.count}</strong></div>)}
          {requests.some((request) => request.statut === "Client (historique)") && <div className="status-tile status-legacy"><span>Statut historique</span><strong>{requests.filter((request) => request.statut === "Client (historique)").length}</strong></div>}
        </div>
      </section>

      <section className="chart-grid">
        <article className="dashboard-panel chart-panel"><div className="panel-heading"><div><p className="eyebrow">Répartition</p><h2>Demandes par type</h2></div><span className="chart-caption">Données locales fictives</span></div>
          <div className="bar-chart">{byType.map((item, index) => <div className="bar-row" key={item.label}><span>{item.label}</span><div className="bar-track"><i className={`bar-fill bar-${index}`} style={{ width: `${(item.count / maxType) * 100}%` }} /></div><strong>{item.count}</strong></div>)}</div>
        </article>
        <article className="dashboard-panel chart-panel"><div className="panel-heading"><div><p className="eyebrow">Budgets</p><h2>Demandes par prix</h2></div><span className="chart-caption">Exemple fictif</span></div>
          <div className="bar-chart">{budgetDemo.map((item, index) => <div className="bar-row" key={item.label}><span>{item.label}</span><div className="bar-track"><i className={`bar-fill bar-${index}`} style={{ width: `${(item.count / maxBudget) * 100}%` }} /></div><strong>{item.count}</strong></div>)}</div>
          <p className="chart-footnote">Distribution illustrative, indépendante des budgets saisis dans les fiches.</p>
        </article>
      </section>

      <section className="dashboard-panel"><div className="panel-heading"><div><p className="eyebrow">À suivre</p><h2>Demandes récentes</h2></div><Link href="/crm/demandes">Ouvrir le CRM →</Link></div>
        {recent.length ? <div className="recent-list">{recent.map((request) => <Link className="recent-row" href={`/crm/${request.id}`} key={request.id}><span className="recent-avatar">{request.contactNom.slice(0, 1)}</span><span className="recent-name"><strong>{request.contactNom}</strong><small>{request.typeSeance} · {request.dateSouhaitee || "Date à définir"}</small></span><span className="status-badge">{request.statut}</span><span className="row-arrow">→</span></Link>)}</div> : <p className="empty-state">Aucune demande enregistrée.</p>}
      </section>
    </div>
  );
}
