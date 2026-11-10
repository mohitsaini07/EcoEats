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
      <body className="min-h-full font-sans">
        <a className="eco-skip-link" href="#main-content">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
