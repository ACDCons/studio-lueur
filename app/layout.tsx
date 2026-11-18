import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Studio Lueur", description: "Projet d’exercice fictif du bootcamp Builder AI" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
