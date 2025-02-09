import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ClientLayout from './ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GeoEduPortal',
  description: 'Portal de noticias internacionales',
  applicationName: 'GeoEduPortal',
  keywords: ['noticias', 'educación', 'internacionales', 'mapas interactivos'],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0055a5',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen bg-gray-100`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
