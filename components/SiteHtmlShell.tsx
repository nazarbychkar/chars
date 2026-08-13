import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AppProvider } from "@/lib/GeneralProvider";
import { BasketProvider } from "@/lib/BasketProvider";
import { registerServiceWorker } from "@/lib/registerSW";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { WebVitals } from "@/components/shared/WebVitals";
import MainContent from "@/components/shared/MainContent";
import SmoothScrollInit from "@/components/shared/SmoothScrollInit";
import {
  generateOrganizationStructuredData,
  generateWebsiteStructuredData,
} from "@/lib/seo";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { HTML_LANG, getSiteUrl } from "@/lib/i18n/seo";
import type { Locale } from "@/lib/i18n/config";
import { Manrope, Cormorant_Garamond } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: true,
  variable: "--font-manrope",
  adjustFontFallback: true,
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  // Static family (no variable cut in next/font) — keep explicit weights.
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
  variable: "--font-cormorant",
  adjustFontFallback: true,
});

export default function SiteHtmlShell({
  lang,
  children,
}: {
  lang: Locale;
  children: React.ReactNode;
}) {
  const baseUrl = getSiteUrl();

  return (
    <html
      lang={HTML_LANG[lang]}
      className={`${manrope.variable} ${cormorant.variable} ${manrope.className}`}
    >
      <head>
        <meta name="format-detection" content="telephone=no" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#072a6b" />
        <meta name="msapplication-TileColor" content="#072a6b" />
        <link
          rel="preload"
          href="/images/light-theme/chars-logo-header-light.png"
          as="image"
        />
        <link rel="preload" href="/images/hero-photo.jpg" as="image" />
        <link
          rel="preload"
          href="/api/products/top-sale"
          as="fetch"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/images/IMG_0043.JPG"
          as="image"
          media="(min-width: 768px)"
        />
        <link
          rel="preload"
          href="/images/IMAGE-2025-10-17_21-48-37.jpg"
          as="image"
          media="(min-width: 768px)"
        />
        <link rel="dns-prefetch" href="https://www.clarity.ms" />
        <link
          rel="preconnect"
          href="https://www.clarity.ms"
          crossOrigin="anonymous"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
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
                var isFinal = path === '/final' || /\\/final$/.test(path);
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
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1705117413789207&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
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
              <I18nProvider locale={lang}>
                <SmoothScrollInit />
                <Header />
                <MainContent>{children}</MainContent>
                <Footer />
              </I18nProvider>
            </BasketProvider>
          </AppProvider>
        </ErrorBoundary>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (${registerServiceWorker.toString()})();
          `,
          }}
        />
        <WebVitals />
      </body>
    </html>
  );
}
