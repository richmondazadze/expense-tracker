"use client";

import Nav from "@/components/navigation";
import "./globals.css";
import FinanceContextProvider from "@/lib/store/finance-context";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <FinanceContextProvider>
          <Nav />
          {children}
        </FinanceContextProvider>
      </body>
    </html>
  );
}
