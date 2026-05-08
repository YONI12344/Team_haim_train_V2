import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'TEAM HAIM | מערכת אימונים',
  description: 'פלטפורמת ניהול אימונים מקצועית',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html dir="rtl" lang="he">
      <body>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
