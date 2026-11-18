import Link from "next/link";
import { notFound } from "next/navigation";
import EditDemandeForm from "../components/EditDemandeForm";
import DeleteDemandeForm from "../components/DeleteDemandeForm";
import SignOutButton from "../../components/SignOutButton";
import { getDemande } from "@/src/demandes/queries";
import { requireManager } from "@/src/auth/server";

export const dynamic = "force-dynamic";

export default async function DetailDemandePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireManager();
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id < 1) notFound();

  const demande = await getDemande(id);
  if (!demande) notFound();

  return (
    <main>
      <section>
        <p className="eyebrow">Demande #{demande.id}</p>
        <p>Connecté : {session.user.name}</p>
        <SignOutButton />
        <h1>{demande.contactNom}</h1>
        <p><a href={`mailto:${demande.contactEmail}`}>{demande.contactEmail}</a></p>
        <p><Link href="/crm">← Retour aux demandes</Link></p>
      </section>
      <section>
        <h2>Modifier la demande</h2>
        <EditDemandeForm initialValues={{
          id: String(demande.id),
          type_seance: demande.typeSeance,
          date_souhaitee: demande.dateSouhaitee ?? "",
          message: demande.message,
          statut: demande.statut,
          note: demande.note ?? "",
          prochaine_action: demande.prochaineAction ?? "",
        }} />
        <div className="delete-section">
          <h2>Supprimer cette demande</h2>
          <p>Le contact et ses autres demandes seront conservés.</p>
          <DeleteDemandeForm id={demande.id} />
        </div>
      </section>
    </main>
  );
}
