import type { Metadata } from "next";
import { Inter, Roboto, Rubik_Scribble } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const roboto = Roboto({
  weight: ["400", "500"],
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--roboto-font",
});

const rubik = Rubik_Scribble({
  weight: "400",
  subsets: ["latin"],
  style: ["normal"],
  variable: "--rubik-font",
});

const andina = localFont({
  src: "./extras/Andina Demo.otf",
  variable: "--andina-font",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Karrot Market",
    default: "Karrot Market",
  },
  description: "Sell and buy all the things!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`
          ${inter.className} ${roboto.variable} ${rubik.variable} ${andina.variable}
          bg-neutral-900 text-white max-w-screen-sm mx-auto
        `}
      >
        {children}
      </body>
    </html>
  );
}
