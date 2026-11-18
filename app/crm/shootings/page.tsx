import { listShootings } from "@/src/crm/queries";
import ShootingsTable from "./ShootingsTable";

export const dynamic = "force-dynamic";

export default async function ShootingsPage() {
  const shootings = await listShootings();
  return <div className="requests-page"><header className="page-header"><div><p className="eyebrow">CRM · {shootings.length} shootings</p><h1>Shootings</h1><p>Les shootings sont toujours liés à un client et peuvent aussi être associés à une demande.</p></div></header><ShootingsTable shootings={shootings} /></div>;
}
