import { Inter, Roboto_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Suspense } from "react";
import ClientWrapper from "@/components/ClientWrapper";
import Loading from "./loading";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const mono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata = {
  title: "mlima.com",
  description: "online-shopping",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="antialiased">
        <Suspense fallback={<Loading />}>
          <AuthProvider>
            <ClientWrapper>{children}</ClientWrapper>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
