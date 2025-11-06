import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "HERBIT",
  description:
    "HERBIT membantu ibu rumah tangga menumbuhkan kebiasaan hijau dari rumah dengan tracker, eco-enzym, chat AI, dan rewards.",
  icons: {
    icon: "/splashScreen/1.png",
  },
  openGraph: {
    title: "HERBIT",
    description:
      "HERBIT membantu ibu rumah tangga menumbuhkan kebiasaan hijau dari rumah dengan tracker, eco-enzym, chat AI, dan rewards.",
    url: "https://herbit-fe.vercel.app",
    siteName: "HERBIT",
    images: [
      {
        url: "https://herbit-fe.vercel.app/splashScreen/1.png",
        width: 1200,
        height: 630,
        alt: "HERBIT",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
