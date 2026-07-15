export type SeasonValue = "Літо" | "Осінь" | "Зима" | "Весна";

export type SeasonCard = {
  value: SeasonValue;
  image: string;
  /** Compact image for menus */
  imageThumb?: string;
};

/** Order: актуал сезон зверху (Літо → … → Весна) */
export const SEASON_CARDS: SeasonCard[] = [
  {
    value: "Літо",
    image: "/images/summer2.jpg",
    imageThumb: "/images/summer.png",
  },
  {
    value: "Осінь",
    image: "/images/autumn2.jpg",
  },
  {
    value: "Зима",
    image: "/images/winter2.jpg",
    imageThumb: "/images/winter.png",
  },
  {
    value: "Весна",
    image: "/images/spring2.jpg",
    imageThumb: "/images/spring.png",
  },
];
