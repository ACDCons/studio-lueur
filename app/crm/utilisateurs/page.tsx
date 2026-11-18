import { redirect } from "next/navigation";
import { assignUserRole, createRole, deleteRole, updateRole } from "@/app/actions/crm";
import { requireAdministrator } from "@/src/auth/server";
import { listUsersAndRoles } from "@/src/crm/queries";

export const dynamic = "force-dynamic";

export default async function UtilisateursPage({ searchParams }: { searchParams: Promise<{ role?: string; utilisateur?: string; admin?: string }> }) {
  await requireAdministrator();
  const [{ users, roles }, query] = await Promise.all([listUsersAndRoles(), searchParams]);
  if (!roles.some((role) => role.id === "admin") || !roles.some((role) => role.id === "user")) redirect("/crm");
  const roleCounts = new Map<string, number>();
  for (const account of users) roleCounts.set(account.role ?? "user", (roleCounts.get(account.role ?? "user") ?? 0) + 1);
  return <div className="requests-page"><header className="page-header"><div><p className="eyebrow">CRM · accès</p><h1>Utilisateurs et rôles</h1><p>Gère l’accès au CRM pour les comptes locaux existants.</p></div></header>
    {query.role === "existe" && <p className="form-error" role="alert">Ce nom de rôle est déjà utilisé.</p>}
    {query.role === "erreur" && <p className="form-error" role="alert">Le nom du rôle est invalide ou réservé.</p>}
    {query.role === "attribue" && <p className="form-error" role="alert">Réattribue les utilisateurs avant de supprimer ce rôle.</p>}
    {query.admin === "dernier" && <p className="form-error" role="alert">Le dernier compte administrateur ne peut pas perdre son rôle.</p>}
    {query.utilisateur === "introuvable" && <p className="form-error" role="alert">Le compte ou le rôle sélectionné n’existe plus.</p>}
    <section className="detail-card"><div className="panel-heading"><div><p className="eyebrow">Rôles</p><h2>Créer un rôle</h2></div></div>
      <form action={createRole} className="role-create-form"><label htmlFor="role-name">Nom du rôle<input id="role-name" name="nom" maxLength={60} required /></label><label className="checkbox-line"><input type="checkbox" name="acces_crm" />Ce rôle peut accéder au CRM</label><button type="submit">Créer le rôle</button></form>
      <div className="role-list">{roles.map((role) => <div className="role-row" key={role.id}><div className="role-heading"><strong>{role.nom}</strong><small>{role.accesCrm ? "Accès CRM" : "Sans accès CRM"} · {roleCounts.get(role.id) ?? 0} utilisateur{(roleCounts.get(role.id) ?? 0) > 1 ? "s" : ""}</small></div>{role.roleSysteme ? <span className="muted-text">Rôle système</span> : <div className="role-actions"><form action={updateRole} className="role-edit-form"><input type="hidden" name="role_id" value={role.id} readOnly /><label>Nom<input name="nom" maxLength={60} defaultValue={role.nom} required /></label><label className="checkbox-line"><input type="checkbox" name="acces_crm" defaultChecked={role.accesCrm} />Accès CRM</label><button type="submit" className="button-secondary">Enregistrer</button></form><form action={deleteRole}><input type="hidden" name="role_id" value={role.id} readOnly /><button className="button-danger" type="submit" disabled={(roleCounts.get(role.id) ?? 0) > 0}>Supprimer</button></form></div>}</div>)}</div>
    </section>
    <section className="detail-card"><div className="panel-heading"><div><p className="eyebrow">Comptes Better Auth</p><h2>Utilisateurs</h2></div><span>{users.length} compte{users.length > 1 ? "s" : ""}</span></div>
      {users.length ? <div className="user-table-wrap"><table className="request-table"><thead><tr><th>Nom</th><th>E-mail</th><th>Rôle</th><th>Enregistrer</th></tr></thead><tbody>{users.map((account) => <tr key={account.id}><td>{account.nom}</td><td>{account.email}</td><td colSpan={2}><form action={assignUserRole} className="inline-status-form"><input type="hidden" name="user_id" value={account.id} readOnly /><select name="role_id" aria-label={`Rôle de ${account.nom}`} defaultValue={account.role ?? "user"}>{roles.map((role) => <option key={role.id} value={role.id}>{role.nom}</option>)}</select><button type="submit">Enregistrer le rôle</button></form></td></tr>)}</tbody></table></div> : <div className="empty-state"><h2>Aucun compte local</h2><p>Les comptes sont créés par l’opération locale d’administration prévue par le projet.</p></div>}
    </section>
  </div>;
}
