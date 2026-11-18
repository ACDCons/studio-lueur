import Link from "next/link";
import NewDemandeForm from "../components/NewDemandeForm";

export default function NouvelleDemandePage() {
  return <div className="new-request-page">
    <header className="page-header"><div><p className="eyebrow">CRM · ajout manuel</p><h1>Nouvelle demande</h1><p>Pour un projet reçu par téléphone ou en personne.</p></div><Link href="/crm/demandes">← Retour aux demandes</Link></header>
    <section className="detail-card"><NewDemandeForm /></section>
  </div>;
}
