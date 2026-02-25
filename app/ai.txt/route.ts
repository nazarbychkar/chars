import { NextResponse } from "next/server";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://charsua.com";

export function GET() {
  const body = [
    "# AI crawling and usage policy for CHARS",
    "# Language: Ukrainian",
    "Сайт CHARS дозволяє індексацію сторінок для цілей пошуку,",
    "але забороняє використання контенту (тексти, зображення, відео)",
    "для тренування моделей штучного інтелекту без письмової згоди власника.",
    "",
    "# Language: German",
    "Die Website CHARS erlaubt die Indexierung der Seiten für Suchzwecke,",
    "verbietet jedoch die Nutzung der Inhalte (Texte, Bilder, Videos)",
    "zum Training von KI‑Modellen ohne vorherige schriftliche Zustimmung des Rechteinhabers.",
    "",
    "# Language: English",
    "The CHARS website allows page indexing for search purposes,",
    "but forbids using its content (texts, images, videos)",
    "to train AI models without prior written consent of the rights holder.",
    "",
    `Sitemap: ${baseUrl}/sitemap.xml`,
    "",
    "Contact: charsukrainianbrand@gmail.com",
  ].join("\n");

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

