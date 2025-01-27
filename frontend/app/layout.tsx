import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ClientLayout from './ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GeoEduPortal',
  description: 'Portal educativo de geología y ciencias de la tierra',
  applicationName: 'GeoEduPortal',
  keywords: ['geología', 'educación', 'ciencias de la tierra', 'mapas interactivos'],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0055a5',
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
