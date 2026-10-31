import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🌟 On ajoute les infos de la PWA dans les metadata
export const metadata: Metadata = {
  title: "ZinSchool", // On change le titre
  description: "La plateforme éducative intelligente.", // On change la description
  manifest: "/manifest.json", // 👈 Lien vers le fichier manifest
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ZinSchool",
  },
};

// 🌟 On ajoute le Viewport pour la couleur de la barre d'état sur mobile
export const viewport: Viewport = {
  themeColor: "#4f46e5", // La couleur indigo de ZinSchool (ajuste si besoin)
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr" // 🌟 On passe en français (ou 'ar' si tu préfères)
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}