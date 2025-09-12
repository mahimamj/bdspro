import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BDS PRO - Crypto Trading & Investment Platform',
  description: 'Empowering traders through high-quality tools, education, and support. Fast transactions, dedicated team, 24/7 support, and secure operations.',
  keywords: 'crypto trading, investment platform, USDT, cryptocurrency, trading tools',
  authors: [{ name: 'BDS PRO Team' }],
  openGraph: {
    title: 'BDS PRO - Crypto Trading & Investment Platform',
    description: 'Empowering traders through high-quality tools, education, and support.',
    url: 'https://www.bdspro.io',
    siteName: 'BDS PRO',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'BDS PRO Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BDS PRO - Crypto Trading & Investment Platform',
    description: 'Empowering traders through high-quality tools, education, and support.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        {children}
      </body>
    </html>
  )
}
