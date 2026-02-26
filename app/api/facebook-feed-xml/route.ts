import { NextResponse } from "next/server";
import { sqlGetAllProductsUncached } from "@/lib/sql";
import { buildProductSlug } from "@/lib/slug";

const baseUrl = process.env.PUBLIC_URL || "https://charsua.com";

type FeedLocale = "uk" | "en" | "de";

type ProductRow = {
  id: number;
  name: string;
  name_en?: string | null;
  name_de?: string | null;
  description?: string | null;
  description_en?: string | null;
  description_de?: string | null;
  price: number | string;
  price_eur?: number | string | null;
  first_media?: { url: string; type: string } | null;
};

function xmlEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getLocaleFromRequest(request: Request): FeedLocale {
  try {
    const { searchParams } = new URL(request.url);
    const lang = (searchParams.get("lang") || "").toLowerCase();
    if (lang === "en" || lang === "de" || lang === "uk") {
      return lang;
    }
  } catch {
    // ignore
  }
  return "uk";
}

export async function GET(request: Request) {
  try {
    const locale = getLocaleFromRequest(request);
    const products = (await sqlGetAllProductsUncached()) as ProductRow[];

    let itemsXml = "";

    for (const p of products) {
      const id = p.id;

      let title: string = p.name;
      let description: string =
        p.description || p.description_en || p.description_de || p.name;

      if (locale === "en") {
        title = p.name_en || p.name;
        description =
          p.description_en || p.description || p.description_de || p.name;
      } else if (locale === "de") {
        title = p.name_de || p.name;
        description =
          p.description_de || p.description || p.description_en || p.name;
      }

      const rawPriceEur = p.price_eur;
      const rawPrice = p.price;

      const numericPriceEur =
        rawPriceEur !== null && rawPriceEur !== undefined
          ? Number(rawPriceEur)
          : NaN;
      const numericPrice =
        rawPrice !== null && rawPrice !== undefined ? Number(rawPrice) : NaN;

      let priceValue = 0;
      let currency = "UAH";

      if (locale === "uk") {
        if (Number.isFinite(numericPrice)) {
          priceValue = numericPrice;
        }
        currency = "UAH";
      } else {
        if (Number.isFinite(numericPriceEur)) {
          priceValue = numericPriceEur;
          currency = "EUR";
        } else if (Number.isFinite(numericPrice)) {
          priceValue = numericPrice;
          currency = "UAH";
        }
      }

      const price = `${priceValue.toFixed(2)} ${currency}`;

      const slug = buildProductSlug(p.name, p.id);
      const link = `${baseUrl}/product/${slug}`;

      let imageLink = "";
      if (p.first_media && p.first_media.url) {
        imageLink = `${baseUrl}/api/images/${p.first_media.url}`;
      }

      const brand = "CHARS";
      const availability = "in stock";
      const condition = "new";
      const googleProductCategory = "";

      itemsXml += `
    <item>
      <g:id>${xmlEscape(id)}</g:id>
      <g:title>${xmlEscape(title)}</g:title>
      <g:description>${xmlEscape(description)}</g:description>
      <g:link>${xmlEscape(link)}</g:link>
      <g:image_link>${xmlEscape(imageLink)}</g:image_link>
      <g:availability>${xmlEscape(availability)}</g:availability>
      <g:condition>${xmlEscape(condition)}</g:condition>
      <g:price>${xmlEscape(price)}</g:price>
      <g:brand>${xmlEscape(brand)}</g:brand>
      <g:google_product_category>${xmlEscape(
        googleProductCategory
      )}</g:google_product_category>
    </item>`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>CHARS Catalog</title>
    <link>${xmlEscape(baseUrl)}</link>
    <description>CHARS product feed for Facebook Commerce Manager</description>${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("[GET /api/facebook-feed-xml]", error);
    return NextResponse.json(
      { error: "Failed to generate Facebook XML feed" },
      { status: 500 }
    );
  }
}

