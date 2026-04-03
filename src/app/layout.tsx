import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xray - Multi-Provider AI Chat",
  description: "Chat with any AI model from a single interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
