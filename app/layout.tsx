import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TiendaBT - Sistema de Gestión",
  description: "Sistema de gestión de inventario, ventas y gastos para TiendaBT",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-white">{children}</body>
    </html>
  );
}
