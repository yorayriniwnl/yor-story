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
    'A 52-week personal essay project. 9 chapters. One transmission at a time.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
