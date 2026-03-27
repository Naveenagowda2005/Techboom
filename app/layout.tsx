import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Techboom - Your Digital Growth Partner',
    template: '%s | Techboom',
  },
  description:
    'Techboom is a full-service SaaS platform offering app development, web development, GST services, e-commerce setup, influencer marketing, and more.',
  keywords: ['SaaS', 'app development', 'web development', 'GST services', 'e-commerce', 'influencer marketing'],
  authors: [{ name: 'Techboom' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Techboom',
    title: 'Techboom - Your Digital Growth Partner',
    description: 'Full-service SaaS platform for digital growth',
  },
  robots: { index: true, follow: true },
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0f0a1e] text-white antialiased">
        {children}
      </body>
    </html>
  )
}
