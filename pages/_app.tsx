import { AlertProvider } from "@/contexts/alert-context";
import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AlertProvider>
        <Component {...pageProps} />
      </AlertProvider>
    </QueryClientProvider>)
}
