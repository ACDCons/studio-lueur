"use client";

import { useState } from "react";

export default function DemandeForm() {
  const [message, setMessage] = useState("");
  return (
    <form onSubmit={(event) => {
      event.preventDefault();
      setMessage("Démonstration : rien n’est encore enregistré.");
    }}>
      <label>Nom<input name="nom" autoComplete="name" required /></label>
      <label>E-mail<input name="email" type="email" autoComplete="email" required /></label>
      <label>Type de séance
        <select name="type_seance" required defaultValue="">
          <option value="" disabled>Choisir…</option>
          <option>Mariage</option>
          <option>Portrait</option>
          <option>Entreprise</option>
        </select>
      </label>
      <label>Date souhaitée (facultatif)<input name="date_souhaitee" type="date" /></label>
      <label>Votre projet<textarea name="message" rows={5} required /></label>
      <button type="submit">Envoyer la demande</button>
      <p className="demo-note" role="status">{message || "Démonstration : rien n’est encore enregistré."}</p>
    </form>
  );
}
