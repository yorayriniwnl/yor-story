import type { Metadata } from 'next';
import '@fontsource/bebas-neue/index.css';
import '@fontsource-variable/fraunces/index.css';
import '@fontsource-variable/fraunces/wght-italic.css';
import '@fontsource-variable/jetbrains-mono/index.css';
import '../styles/reflections-onair.css';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yorayriniwnl.vercel.app'
  ),
  title: {
    default: 'Reflections // Yor Ayrin',
    template: '%s // Reflections',
  },
  description:
    '52 chapters. 52 weeks. Every Friday. A personal essay project by Yor Ayrin.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <nav style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #333' }}>
          <a href="/" style={{ marginRight: '1rem' }}>Home</a>
          <a href="/reflections">Reflections</a>
        </nav>
        {children}
      </body>
    </html>
  );
}
