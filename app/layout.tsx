import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "EcoEats", template: "%s · EcoEats" },
  description: "Save great food from going to waste.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full bg-slate-50 font-sans text-slate-950">{children}</body>
    </html>
  );
}
