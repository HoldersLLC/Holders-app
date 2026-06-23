import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Holders — Firearm Maintenance Tracker',
  description: 'Professional firearm maintenance tracking, range logs, and inventory management.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Holders' },
}

export const viewport: Viewport = {
  themeColor: '#0f1117',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-surface text-white antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#171b24', color: '#fff', border: '1px solid #252b38' },
          }}
        />
      </body>
    </html>
  )
}
