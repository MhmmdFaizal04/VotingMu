import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "VoteLive - Real-time Polling",
  description: "Buat dan ikuti polling secara real-time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${bricolage.variable} h-full`}>
      <body className={`${bricolage.className} min-h-full flex flex-col bg-[#f0f2f5] text-[#111b21]`}>{children}</body>
    </html>
  );
}
