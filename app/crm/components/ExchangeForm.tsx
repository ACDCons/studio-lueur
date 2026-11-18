import { addExchange } from "@/app/actions/demandes";

export default function ExchangeForm({ requestId }: { requestId: number }) {
  return <form action={addExchange} className="exchange-form">
    <input type="hidden" name="demande_id" value={requestId} readOnly />
    <label htmlFor="exchange-author">Échange rédigé par
      <select id="exchange-author" name="auteur" defaultValue="Studio"><option value="Studio">Studio</option><option value="Client">Client</option></select>
    </label>
    <label htmlFor="exchange-content">Ajouter un échange
      <textarea id="exchange-content" name="contenu" rows={4} maxLength={5000} required placeholder="Notez un appel, un e-mail ou un message reçu…" />
    </label>
    <button type="submit">Ajouter à l’historique</button>
  </form>;
}
