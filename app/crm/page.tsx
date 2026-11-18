import { listDemandes } from "@/src/demandes/queries";
import DashboardOverview from "./DashboardOverview";

export const dynamic = "force-dynamic";

export default async function CrmPage() {
  const requests = await listDemandes();
  return <DashboardOverview requests={requests} />;
}
