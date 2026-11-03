import "@/styles/globals.css"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@/components/analytics"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeProvider } from "@/components/theme-provider"

interface RootLayoutProps {
  children: React.ReactNode
}

export const metadata = {
  title: {
    default: "Apex Desk | Inner Circle Trading Floor",
    template: `%s | Apex Desk`,
  },
  description:
    "Live market setups, institutional order flow breakdowns, and weekly mentor chart reviews.",
  keywords: [
    "Forex",
    "Gold",
    "XAUUSD",
    "Trading Signals",
    "Market Analysis",
    "Apex Desk",
  ],
  authors: [
    {
      name: "Apex Desk",
      url: siteConfig.url,
    },
  ],
  creator: "Apex Desk",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: "Apex Desk | Inner Circle Trading Floor",
    description:
      "Live market setups, institutional order flow breakdowns, and weekly mentor chart reviews.",
    siteName: "Apex Desk",
  },
  twitter: {
    card: "summary_large_image",
    title: "Apex Desk | Inner Circle Trading Floor",
    description:
      "Live market setups, institutional order flow breakdowns, and weekly mentor chart reviews.",
    images: [`${siteConfig.url}/og.jpg`],
    creator: "@apexdesk",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Analytics />
          <Toaster />
          <TailwindIndicator />
        </ThemeProvider>
      </body>
    </html>
  )
}