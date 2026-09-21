import './globals.css';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import AppProviders from 'components/providers/AppProviders';

export const metadata: Metadata = {
  title: 'Tredella Admin',
  description: 'Operations console for the Tredella marketplace.',
  // an internal console has no business being indexed
  robots: { index: false, follow: false }
};

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-Poppins',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap'
});

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-poppins antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
