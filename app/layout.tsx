import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LinkNest — Private Bookmark Manager",
  description: "Your private space for saving and organizing links.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-white via-white to-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
