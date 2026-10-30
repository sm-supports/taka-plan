import type { Metadata, Viewport } from "next";
import { RegisterSW } from "@/components/pwa/RegisterSW";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taka Plan",
  description: "A free Bangla/English personal-finance planner for Bangladesh: a full savings plan from five questions in under three minutes, no account needed.",
  applicationName: "Taka Plan",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b7f6d",
};

/** vinext sets __VINEXT_BUILD_ID on the server for production builds; BUILD_ID is an escape hatch for other hosts. */
function buildId(): string {
  return process.env.__VINEXT_BUILD_ID ?? process.env.BUILD_ID ?? "dev";
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn">
      <body>
        {children}
        <RegisterSW buildId={buildId()} />
      </body>
    </html>
  );
}
