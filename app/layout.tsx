import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/components/AuthProvider";

const description =
  "A community forum and discussion platform for posts, comments, and threaded conversations.";

function getMetadataBase() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!siteUrl) {
    return undefined;
  }

  try {
    return new URL(siteUrl);
  } catch {
    return undefined;
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "OpenForum",
    template: "%s | OpenForum",
  },
  description,
  applicationName: "OpenForum",
  openGraph: {
    title: "OpenForum",
    description,
    siteName: "OpenForum",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "OpenForum",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <AuthProvider>
          <Navbar />
          <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
