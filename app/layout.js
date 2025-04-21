import { Inter, Roboto_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Suspense } from "react";
import ClientWrapper from "@/components/ClientWrapper";
import Loading from "./loading";
import { AuthProvider } from "@/context/AuthContext";
import Head from "next/head";

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
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </Head>
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
