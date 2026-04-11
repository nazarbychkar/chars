import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./critical.css";
import "./globals.css";
import "./mobile-optimizations.css";
import "./animations.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AppProvider } from "@/lib/GeneralProvider";
import { BasketProvider } from "@/lib/BasketProvider";
import { registerServiceWorker } from "@/lib/registerSW";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { WebVitals } from "@/components/shared/WebVitals";
import MainContent from "@/components/shared/MainContent";
import SmoothScrollInit from "@/components/shared/SmoothScrollInit";
import { generateOrganizationStructuredData, generateWebsiteStructuredData } from "@/lib/seo";
import { I18nProvider } from "@/lib/i18n/I18nProvider";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
  variable: "--font-inter",
  adjustFontFallback: true,
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://charsua.com';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default:
      "CHARS — Український Бренд Чоловічого Одягу | Стиль Без Компромісів",
    template: "%s | CHARS",
  },
  description:
    "CHARS — український бренд чоловічого одягу, заснований у 2023 році. Ми створюємо стильний одяг для різних чоловіків без компромісів. Класика, кежуал та спорт. Замовляйте онлайн з доставкою по Україні.",
  keywords:
    "CHARS, український бренд одягу, чоловічий одяг, стильний одяг, смарт-кежуал, кежуал-класик, українська мода, одяг для чоловіків, київ, купити одяг онлайн, доставка по Україні",
  authors: [{ name: "CHARS" }],
  creator: "CHARS",
  publisher: "CHARS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/images/CHARS-06.png",
    shortcut: "/images/CHARS-06.png",
    apple: "/images/CHARS-06.png",
  },
  openGraph: {
    type: "website",
    locale: "uk_UA",
    alternateLocale: ["de_DE", "en_US"],
    url: baseUrl,
    siteName: "CHARS",
    title: "CHARS — Український Бренд Чоловічого Одягу",
    description:
      "Стильний чоловічий одяг без компромісів. Класика, кежуал та спорт. Замовляйте онлайн з доставкою по Україні.",
    images: [
      {
        url: `${baseUrl}/images/IMG_5887.JPG`,
        width: 1200,
        height: 630,
        alt: "CHARS — Український Бренд Чоловічого Одягу",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CHARS — Український Бренд Чоловічого Одягу",
    description:
      "Стильний чоловічий одяг без компромісів. Класика, кежуал та спорт.",
    images: [`${baseUrl}/images/IMG_5887.JPG`],
  },
  alternates: {
    canonical: baseUrl,
    languages: {
      uk: `${baseUrl}/uk`,
      de: `${baseUrl}/de`,
      en: `${baseUrl}/en`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className={inter.className}>
      <head>
        {/* Mobile viewport optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Favicon and App Icons */}
        <link rel="icon" type="image/png" href="/images/CHARS-06.png" />
        <link rel="shortcut icon" type="image/png" href="/images/CHARS-06.png" />
        <link rel="apple-touch-icon" href="/images/CHARS-06.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/images/light-theme/chars-logo-header-light.png" as="image" />
        {/* Conditional preload: image for mobile, video for desktop */}
        <link rel="preload" href="/images/Знімок екрана 2025-10-17 о 22.25.53.png" as="image" media="(max-width: 767px)" />
        <link rel="preload" href="/images/IMG_5831.webm" as="video" type="video/webm" media="(min-width: 768px)" />
        <link rel="preload" href="/api/products/top-sale" as="fetch" crossOrigin="anonymous" />
        
        {/* Conditional preload for mobile vs desktop */}
        <link rel="preload" href="/images/IMG_0043.JPG" as="image" media="(min-width: 768px)" />
        <link rel="preload" href="/images/IMAGE-2025-10-17_21-48-37.jpg" as="image" media="(min-width: 768px)" />
        
        {/* Mobile-specific prefetch */}
        <link rel="prefetch" href="/catalog" />
        <link rel="prefetch" href="/api/products?limit=12" />
        
        {/* DNS prefetch and preconnect */}
        <link rel="dns-prefetch" href="//placehold.co" />
        <link rel="preconnect" href="https://placehold.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.clarity.ms" />
        <link rel="preconnect" href="https://www.clarity.ms" crossOrigin="anonymous" />
        
        {/* Resource hints for better performance */}
        <link rel="modulepreload" href="/_next/static/chunks/webpack.js" />
        <link rel="modulepreload" href="/_next/static/chunks/framework.js" />
        <link rel="modulepreload" href="/_next/static/chunks/main.js" />
        
        {/* Mobile-specific optimizations */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Apple touch icon */}
        <link rel="apple-touch-icon" href="/images/CHARS-06.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1705117413789207');
              (function(){
                var path = (window.location.pathname || '').replace(/\\/$/, '');
                var isFinal = path === '/final' || path.endsWith('/final');
                var thankYou = /[?&]payment=success(?:&|$)/.test(window.location.search || '');
                if (!thankYou && isFinal) {
                  try { thankYou = window.localStorage.getItem('paymentSuccess') === 'true'; } catch (e) {}
                }
                if (!isFinal || !thankYou) {
                  fbq('track', 'PageView');
                }
              })();
            `,
          }}
        />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1705117413789207&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}

        {/* Microsoft Clarity — deferred after load + idle to limit main-thread impact */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var id="w6vivmh1ub";
                function boot(){
                  (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                  })(window,document,"clarity","script",id);
                }
                function schedule(){
                  if(typeof requestIdleCallback==="function"){
                    requestIdleCallback(boot,{timeout:4000});
                  }else{
                    setTimeout(boot,0);
                  }
                }
                if(document.readyState==="complete")schedule();
                else window.addEventListener("load",schedule,{once:true});
              })();
            `,
          }}
        />
        {/* End Microsoft Clarity */}
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationStructuredData(baseUrl)),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateWebsiteStructuredData(baseUrl)),
          }}
        />
        <ErrorBoundary>
          <AppProvider>
            <BasketProvider>
              <I18nProvider>
                <SmoothScrollInit />
                <Header />
                <MainContent>{children}</MainContent>
                <Footer />
              </I18nProvider>
            </BasketProvider>
          </AppProvider>
        </ErrorBoundary>
        <script dangerouslySetInnerHTML={{
          __html: `
            (${registerServiceWorker.toString()})();
          `
        }} />
        <WebVitals />
      </body>
    </html>
  );
}
