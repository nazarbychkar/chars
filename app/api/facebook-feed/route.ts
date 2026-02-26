import { NextResponse } from "next/server";
import { sqlGetAllProductsUncached } from "@/lib/sql";
import { buildProductSlug } from "@/lib/slug";

const baseUrl = process.env.PUBLIC_URL || "https://charsua.com";

type FeedLocale = "uk" | "en" | "de";

// Helper to escape CSV fields (Facebook accepts standard RFC4180 CSV)
function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Wrap in quotes and escape inner quotes
  const needsQuotes = /[",\n\r]/.test(str);
  if (needsQuotes) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
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
    const products = await sqlGetAllProductsUncached();

    // Facebook Commerce Manager typical headers
    const headers = [
      "id",
      "title",
      "description",
      "availability",
      "condition",
      "price",
      "link",
      "image_link",
      "brand",
      "google_product_category",
    ];

    const lines: string[] = [];
    lines.push(headers.join(","));

    for (const p of products as any[]) {
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

      // Availability: in stock if є хоч один розмір зі stock > 0, інакше out of stock.
      // Тут products з _sqlGetAllProducts не мають sizes, тому вважаємо in stock.
      const availability = "in stock";

      const condition = "new";

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
        // Українська версія: завжди гривня
        if (Number.isFinite(numericPrice)) {
          priceValue = numericPrice;
        }
        currency = "UAH";
      } else {
        // EN / DE: намагаємося віддати EUR, якщо price_eur є
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

      // Можна залишити порожнім або підставити загальну категорію
      const googleProductCategory = "";

      const row = [
        csvEscape(id),
        csvEscape(title),
        csvEscape(description),
        csvEscape(availability),
        csvEscape(condition),
        csvEscape(price),
        csvEscape(link),
        csvEscape(imageLink),
        csvEscape(brand),
        csvEscape(googleProductCategory),
      ].join(",");

      lines.push(row);
    }

    const csv = lines.join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("[GET /api/facebook-feed]", error);
    return NextResponse.json(
      { error: "Failed to generate Facebook feed" },
      { status: 500 }
    );
  }
}

