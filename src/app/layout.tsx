import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Symbolic AI Website Engine',
  description:
    'A living interface that reinterprets the same truth through different symbolic metaphors on every visit. Powered by Gemini AI.',
  keywords: ['AI', 'symbolic design', 'portfolio', 'generative interface'],
  openGraph: {
    title: 'Symbolic AI Website Engine',
    description: 'A poetic AI interpreter of identity. Each visit, a new metaphor.',
    type: 'website',
  },
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
