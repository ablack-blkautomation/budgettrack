import "./globals.css";
import { Providers } from "@/components/Providers";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "BudgetTrack",
  description: "Secure Personal Budget & Expense Manager",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
