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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn">
      <body>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
