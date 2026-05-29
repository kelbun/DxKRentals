import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "DxK Rentals — Luxury Car Rentals",
  description:
    "Access the world's most coveted automobiles. Curated for those who demand nothing short of extraordinary.",
  openGraph: {
    title: "DxK Rentals",
    description: "Luxury Car Rentals",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
