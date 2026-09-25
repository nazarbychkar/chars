export type SeasonValue = "Літо" | "Осінь" | "Зима" | "Весна";

/** Order: актуальний сезон зверху (Літо → … → Весна) */
export const SEASON_VALUES: SeasonValue[] = [
  "Літо",
  "Осінь",
  "Зима",
  "Весна",
];

export type SeasonLabels = {
  seasonSummer: string;
  seasonAutumn: string;
  seasonWinter: string;
  seasonSpring: string;
};

export function getSeasonLabel(
  value: SeasonValue,
  labels: SeasonLabels
): string {
  switch (value) {
    case "Літо":
      return labels.seasonSummer;
    case "Осінь":
      return labels.seasonAutumn;
    case "Зима":
      return labels.seasonWinter;
    case "Весна":
      return labels.seasonSpring;
  }
}

export function seasonCatalogHref(value: SeasonValue): string {
  return `/catalog?season=${encodeURIComponent(value)}`;
}
