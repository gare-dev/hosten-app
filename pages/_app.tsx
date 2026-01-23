import { AlertProvider } from "@/context/alert-context";
import { ConfirmProvider } from "@/context/confirm-context";
import { ServerProvider } from "@/context/server-context";
import { ThemeProvider } from "@/context/theme-context";
import "@/styles/theme.scss";
import "@/styles/globals.css";
import { HydrationBoundary, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <>
      <Head>
        <meta name="theme-color" content="#0a0f1a" />
        <meta name="color-scheme" content="dark light" />
      </Head>
      <ThemeProvider defaultTheme="system">
        <QueryClientProvider client={queryClient}>
          <HydrationBoundary state={pageProps.dehydratedState}>
            <ConfirmProvider>
              <ServerProvider>
                <AlertProvider>
                  <Component {...pageProps} />
                </AlertProvider>
              </ServerProvider>
            </ConfirmProvider>
          </HydrationBoundary>
        </QueryClientProvider>
      </ThemeProvider>
    </>
  );
}
