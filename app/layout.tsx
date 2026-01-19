import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'

export const metadata: Metadata = {
  title: 'How can I help ?',
  description: 'AI Chat Portal',
}

/**
 * Root Layout
 * 
 * Minimal layout - each page handles its own auth UI.
 * - /login has its own layout
 * - /chat has ChatHeader with user info
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

