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
      <button type="submit" className="delete-icon-button" aria-label={`Supprimer la demande ${id}`} title="Supprimer cette demande">
        <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7h16" />
          <path d="M10 11v6M14 11v6" />
          <path d="m5 7 1 13h12l1-13M9 7V4h6v3" />
        </svg>
      </button>
    </form>
  );
}
