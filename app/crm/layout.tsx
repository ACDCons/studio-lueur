import Link from "next/link";
import { requireManager } from "@/src/auth/server";
import SignOutButton from "../components/SignOutButton";

export default async function CrmLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requireManager();
  return (
    <div className="crm-shell">
      <aside className="crm-sidebar">
        <Link className="brand" href="/crm"><span className="brand-mark">SL</span><span>Studio Lueur<small>ESPACE PRIVÉ</small></span></Link>
        <p className="sidebar-label">ESPACE DE TRAVAIL</p>
        <nav className="sidebar-nav" aria-label="Navigation CRM">
          <Link href="/crm">◫ <span>Dashboard</span></Link>
          <Link href="/crm/demandes">▤ <span>Toutes les demandes</span></Link>
        </nav>
        <div className="sidebar-bottom">
          <div className="user-chip"><span className="avatar">{session.user.name.slice(0, 1).toUpperCase()}</span><span>{session.user.name}<small>Gestionnaire</small></span></div>
          <SignOutButton />
        </div>
      </aside>
      <main className="crm-main">{children}</main>
    </div>
  );
}
