import SiteHtmlShell from "@/components/SiteHtmlShell";
import NotFoundContent from "@/app/(site)/[lang]/not-found";
import "@/app/(site)/critical.css";
import "@/app/(site)/globals.css";
import "@/app/(site)/mobile-optimizations.css";
import "@/app/(site)/animations.css";

export default function RootNotFound() {
  return (
    <SiteHtmlShell lang="uk">
      <NotFoundContent />
    </SiteHtmlShell>
  );
}
