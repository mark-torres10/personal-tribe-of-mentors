import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personal Tribe of Mentors",
  description: "Get advice from your personal council of AI mentors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
