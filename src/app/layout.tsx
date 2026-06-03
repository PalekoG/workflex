import type { Metadata } from "next";
import "./globals.css";

import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "WorkFlex",
  description: "Marketplace inteligente de serviços",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-950 text-white min-h-screen">
        
        <Navbar />

        {children}

      </body>
    </html>
  );
}