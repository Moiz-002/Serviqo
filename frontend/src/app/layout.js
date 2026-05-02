import { Inter, Merriweather, Fira_Code } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const merriweather = Merriweather({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const firaCode = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "Serviqo - AI-Powered Home Services Marketplace",
  description: "Connect with verified professionals for electrical, plumbing, carpentry, cleaning, and appliance repair services across Pakistan. Fair pricing, transparent bids, and AI-powered matching.",
  openGraph: {
    title: "Serviqo - Find Skilled Professionals",
    description: "AI-enhanced service marketplace connecting homeowners with verified professionals",
    type: "website",
  },
  icons: {
    icon: '/public/serviqo_favicon.png',
  },
  
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${merriweather.variable} ${firaCode.variable} h-full antialiased`}
    >
    <head>
      <link rel="icon" href="serviqo_favicon.png" />
    </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
