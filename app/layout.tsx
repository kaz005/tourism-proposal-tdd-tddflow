import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '観光事業計画書ジェネレーター',
  description: '高付加価値型観光事業計画書を自動生成するWebアプリケーション',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  観光事業計画書ジェネレーター
                </h1>
              </div>
            </div>
          </div>
        </header>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}