import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthRedirect from '@/components/AuthRedirect'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RESTART_ The Server',
  description: 'AI-First News Aggregator for Builders and Technologists',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-gray-900 text-white antialiased`} suppressHydrationWarning={true}>
        <AuthRedirect />
        {children}
      </body>
    </html>
  )
} 