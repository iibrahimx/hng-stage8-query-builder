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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
          try {
            const dark = localStorage.getItem('query-builder-theme');
            if (dark === 'true') {
              document.documentElement.classList.add('dark');
            }
          } catch {}
        `,
          }}
        />
      </head>

      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
