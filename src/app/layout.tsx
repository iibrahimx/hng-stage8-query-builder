import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Query Builder | Visual Database Query Constructor",
  description:
    "Build complex database queries visually. Create filters, group conditions, nest logic, and preview results in real-time.",
  keywords: [
    "query builder",
    "visual query",
    "database",
    "filter builder",
    "no-code",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
