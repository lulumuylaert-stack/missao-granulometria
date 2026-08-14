import type { Metadata } from "next";
import "./globals.css";
import "./mobile-fix.css";

export const metadata: Metadata = {
  title: "Missão Granulometria — Descubra o Solo",
  description: "Jogo didático interativo de Mecânica dos Solos.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
