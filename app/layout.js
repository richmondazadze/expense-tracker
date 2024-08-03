// "use client";

import Nav from "@/components/navigation";
import "./globals.css";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FinanceContextProvider from "@/lib/store/finance-context";
import AuthContextProvider from "@/lib/store/auth-context";
import { CurrencyProvider } from "@/lib/store/CurrencyContext";

export const metadata = {
  title: "PennyTrack",
  description: "Your financial tracking app",
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  userScalable: false,
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body className="flex flex-col min-h-screen">
        <AuthContextProvider>
          <FinanceContextProvider>
            <CurrencyProvider>
              <ToastContainer />
              <Nav />
              <main className="flex-grow">{children}</main>
              <footer className="bg-slate-800 text-white text-center">
                <div className="py-12">
                  <p>
                    &copy; {new Date().getFullYear()} PennyTrack. All rights
                    reserved.
                  </p>
                  <p>
                    Developed by{" "}
                    <a
                      href="https://www.linkedin.com/in/richmond-azadze"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Richmond Azadze
                    </a>
                  </p>
                </div>
              </footer>
            </CurrencyProvider>
          </FinanceContextProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
