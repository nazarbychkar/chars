type Lang = "uk" | "en" | "de";

async function translateWithGoogleFree(
  text: string,
  targetLang: Lang,
  sourceLang: Lang = "uk"
): Promise<string> {
  if (!text || !text.trim()) return "";

  const langMap: Record<string, string> = {
    uk: "uk",
    en: "en",
    de: "de",
  };

  const source = langMap[sourceLang] ?? "uk";
  const target = langMap[targetLang] ?? "en";

  if (source === target) return text;

  try {
    const params = new URLSearchParams({
      client: "gtx",
      sl: source,
      tl: target,
      dt: "t",
      q: text,
    });

    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?${params.toString()}`
    );
    if (!res.ok) return text;
    const data = await res.json();
    if (Array.isArray(data) && data[0] && Array.isArray(data[0])) {
      const translated = (data[0] as unknown[])
        .map((item) => (Array.isArray(item) ? item[0] : ""))
        .join("");
      return (translated || "").trim();
    }
  } catch (e) {
    console.warn("Translation error (google):", e);
  }

  return text;
}

async function translateWithMyMemory(
  text: string,
  targetLang: Lang,
  sourceLang: Lang = "uk"
): Promise<string> {
  if (!text || !text.trim()) return "";

  const langMap: Record<string, string> = {
    uk: "uk-UA",
    en: "en-US",
    de: "de-DE",
  };

  const source = langMap[sourceLang] ?? "uk-UA";
  const target = langMap[targetLang] ?? "en-US";

  if (source === target) return text;

  try {
    const params = new URLSearchParams({
      q: text,
      langpair: `${source}|${target}`,
    });
    const res = await fetch(
      `https://api.mymemory.translated.net/get?${params.toString()}`
    );
    if (!res.ok) return text;
    const data = await res.json();
    if (data?.responseStatus === 200) {
      const translated = data?.responseData?.translatedText;
      if (
        translated &&
        typeof translated === "string" &&
        translated.toLowerCase() !== text.toLowerCase()
      ) {
        return translated.trim();
      }
    }
  } catch (e) {
    console.warn("Translation error (mymemory):", e);
  }

  return text;
}

export async function translateTextAllLangs(
  text: string,
  sourceLang: Lang = "uk"
): Promise<{ uk: string; en: string; de: string }> {
  if (!text || !text.trim()) {
    return { uk: "", en: "", de: "" };
  }

  const baseText = text.trim();

  const textUk =
    sourceLang === "uk"
      ? baseText
      : await translateWithGoogleFree(baseText, "uk", sourceLang);

  let textEn = await translateWithGoogleFree(baseText, "en", sourceLang);
  let textDe = await translateWithGoogleFree(baseText, "de", sourceLang);

  if (!textEn || textEn === baseText) {
    textEn = await translateWithMyMemory(baseText, "en", sourceLang);
  }
  if (!textDe || textDe === baseText) {
    textDe = await translateWithMyMemory(baseText, "de", sourceLang);
  }

  return {
    uk: textUk || baseText,
    en: textEn || baseText,
    de: textDe || baseText,
  };
}

export type ResolvedProductLocales = {
  nameEn: string;
  nameDe: string;
  descriptionEn: string;
  descriptionDe: string;
  fabricCompositionEn: string;
  fabricCompositionDe: string;
  liningDescriptionEn: string;
  liningDescriptionDe: string;
};

/** Auto-translate all UA product text fields to EN/DE (used on save). */
export async function resolveProductLocalesFromUa(input: {
  name: string;
  description: string;
  fabricComposition: string;
  liningDescription: string;
  hasLining: boolean;
}): Promise<ResolvedProductLocales> {
  const empty = { uk: "", en: "", de: "" };

  const [nameT, descriptionT, fabricT, liningT] = await Promise.all([
    input.name.trim()
      ? translateTextAllLangs(input.name, "uk")
      : Promise.resolve(empty),
    input.description.trim()
      ? translateTextAllLangs(input.description, "uk")
      : Promise.resolve(empty),
    input.fabricComposition.trim()
      ? translateTextAllLangs(input.fabricComposition, "uk")
      : Promise.resolve(empty),
    input.hasLining && input.liningDescription.trim()
      ? translateTextAllLangs(input.liningDescription, "uk")
      : Promise.resolve(empty),
  ]);

  return {
    nameEn: nameT.en,
    nameDe: nameT.de,
    descriptionEn: descriptionT.en,
    descriptionDe: descriptionT.de,
    fabricCompositionEn: fabricT.en,
    fabricCompositionDe: fabricT.de,
    liningDescriptionEn: liningT.en,
    liningDescriptionDe: liningT.de,
  };
}
