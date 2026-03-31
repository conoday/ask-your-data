import type { Metadata } from "next";
import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Ask Your Data — AI Analytics",
  description: "Chat with your business data. Instant charts and insights.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-[#e2e8f0] antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#131929",
              color: "#e2e8f0",
              border: "1px solid #1e2d45",
              borderRadius: "12px",
            },
          }}
        />
      </body>
    </html>
  );
}
