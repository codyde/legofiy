import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LegoifyMe - Transform Your Photos into LEGO Characters',
  description: 'Upload your image and watch as our AI turns you into a LEGO minifigure. It\'s fun, fast, and fantastic!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gradient-to-b from-purple-500 via-purple-400 to-pink-500 min-h-screen`}>
        <div className="flex flex-col min-h-screen">
          <header className="px-4 lg:px-6 h-16 flex items-center bg-white bg-opacity-90 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
              <a href="/" className="flex items-center justify-center">
                <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-600">
                  LegoifyMe
                </span>
              </a>
              <nav className="flex gap-4 sm:gap-6">
                <a className="text-sm font-medium hover:text-yellow-500 transition-colors" href="#how-it-works">
                  How It Works
                </a>
                <a className="text-sm font-medium hover:text-yellow-500 transition-colors" href="#gallery">
                  Gallery
                </a>
                <a className="text-sm font-medium hover:text-yellow-500 transition-colors" href="#about">
                  About
                </a>
              </nav>
            </div>
          </header>
          <main className="flex-grow mx-auto">
            {children}
          </main>
          <footer className="py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white bg-opacity-90">
            <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
              <p className="text-sm text-gray-600 mb-4 sm:mb-0">
                © 2024 LegoifyMe. All rights reserved.
              </p>
              <nav className="flex gap-4 sm:gap-6">
                <a className="text-sm hover:text-yellow-500 transition-colors" href="/terms">
                  Terms of Service
                </a>
                <a className="text-sm hover:text-yellow-500 transition-colors" href="/privacy">
                  Privacy
                </a>
              </nav>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}