import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "متجر مابز | تسوق بسهولة",
  description: "اختر موقعك على الخريطة واطلب منتجاتك بكل سهولة - الدفع عند الاستلام",
};

export const viewport: Viewport = {
  themeColor: "#56d45b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-sans h-full w-full`}>
        {children}
      </body>
    </html>
  );
}
