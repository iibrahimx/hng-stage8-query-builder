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
        {/* 
          This script runs BEFORE React renders.
          It checks localStorage and applies the dark class immediately,
          preventing a "flash of wrong theme" on page load.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem("query-builder-theme");
                  if (theme === "true") {
                    document.documentElement.classList.add("dark");
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
