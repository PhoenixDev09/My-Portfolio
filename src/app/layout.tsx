import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lohith Kumar — Creative Technologist',
  description:
    'Lohith Kumar Parvathaneni is a full stack engineer building systems that think, feel, and scale.',
  keywords: ['Lohith Kumar', 'Creative Technologist', 'Full Stack Engineer', 'AI', 'portfolio'],
  openGraph: {
    title: 'Lohith Kumar — Creative Technologist',
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
