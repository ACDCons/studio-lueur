"use client";

import { deleteDemande } from "@/app/actions/demandes";
import type { FormEvent } from "react";

export default function DeleteDemandeForm({ id }: { id: number }) {
  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Supprimer uniquement la demande ${id} ?`)) event.preventDefault();
  }

  return (
    <form action={deleteDemande} onSubmit={confirmDelete} className="delete-form">
      <input type="hidden" name="demande_id" value={id} readOnly />
      <button type="submit" className="button-danger">Supprimer cette demande</button>
    </form>
  );
}
