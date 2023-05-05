import { Analytics } from '@vercel/analytics/react';
import { Landing } from './components/landing';
import Script from 'next/script';

export default function App() {
  return (
    <>
      <Landing />
      <Analytics />
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-1MKXZ1YR7T"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
           window.dataLayer = window.dataLayer || [];
           function gtag(){dataLayer.push(arguments);}
           gtag('js', new Date());

           gtag('config', 'G-1MKXZ1YR7T');
        `}
      </Script>
    </>
  );
}
