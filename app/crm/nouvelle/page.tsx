import Link from "next/link";
import NewDemandeForm from "../components/NewDemandeForm";
import SignOutButton from "../../components/SignOutButton";
import { requireManager } from "@/src/auth/server";

export default async function NouvelleDemandePage() {
  const session = await requireManager();
  return (
    <main>
      <section>
        <p className="eyebrow">Suivi local</p>
        <h1>Ajouter une demande</h1>
        <p>Connecté : {session.user.name}</p>
        <SignOutButton />
        <p>Pour une demande reçue directement, par exemple par téléphone.</p>
        <NewDemandeForm />
        <p><Link href="/crm">Retour à la liste</Link></p>
      </section>
    </main>
  );
}
