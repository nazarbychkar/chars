import type { Metadata } from "next";
import CollectionsClient from "@/components/collections/CollectionsClient";

export const metadata: Metadata = {
  title: "Колекції | CHARS",
  description:
    "Оберіть сезонну колекцію CHARS: Літо, Осінь, Зима, Весна. Чоловічий одяг для кожного сезону.",
};

export default function CollectionsPage() {
  return <CollectionsClient />;
}
