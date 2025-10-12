import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { AppProvider } from '@/context/AppContext'
import { Toaster } from "@/components/ui/sonner"
import { ExitConfirmationHandler } from '@/components/ui/ExitConfirmationHandler'


export const metadata: Metadata = {
  title: 'ABUNRFEDUSEC',
  description: 'Advanced intercampus vehicle security platform',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <AppProvider>
          <Toaster />
          {children}
          <ExitConfirmationHandler />
        </AppProvider>
      </body>
    </html>
  )
}