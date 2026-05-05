import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sandeep Vadlamudi — Data Analyst',
  description:
    'Sandeep Vadlamudi is a Data Analyst with 3+ years of experience in data reconciliation, operational reporting, and KPI analysis.',
  keywords: ['Sandeep Vadlamudi', 'Data Analyst', 'Power BI', 'SQL', 'Healthcare Data', 'portfolio'],
  openGraph: {
    title: 'Sandeep Vadlamudi — Data Analyst',
    description: 'A poetic AI interpreter of identity. Each visit, a new metaphor.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0d1117',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,400&family=Space+Grotesk:wght@400;500;600&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
