"use client";

import type { Metadata } from "next";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://chars.ua";

export const metadata: Metadata = {
  title: "Договір публічної оферти | CHARS",
  description: "Договір публічної оферти CHARS. Умови використання сайту та покупки товарів. Ознайомтесь з правилами замовлення та доставки.",
  keywords: "CHARS, договір оферти, умови використання, правила замовлення, доставка",
  alternates: {
    canonical: `${baseUrl}/terms-of-service`,
    languages: {
      uk: `${baseUrl}/uk/terms-of-service`,
      de: `${baseUrl}/de/terms-of-service`,
      en: `${baseUrl}/en/terms-of-service`,
    },
  },
  openGraph: {
  title: "Договір публічної оферти | CHARS",
  description: "Договір публічної оферти CHARS",
    type: "website",
    url: `${baseUrl}/terms-of-service`,
    siteName: "CHARS",
    locale: "uk_UA",
    alternateLocale: ["de_DE", "en_US"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfServicePage() {
  const { locale } = useI18n();
  const lang = locale === "en" || locale === "de" ? locale : "uk";

  const backToHomeLabel =
    lang === "en" ? "← Back to home" : lang === "de" ? "← Zur Startseite" : "← На головну";
  const title =
    lang === "en"
      ? "Public offer agreement"
      : lang === "de"
      ? "Vertrag des öffentlichen Angebots"
      : "Договір публічної оферти";

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <Link
            href="/"
            className="inline-block mb-8 text-lg opacity-60 hover:opacity-100 transition-opacity duration-300"
          >
            {backToHomeLabel}
          </Link>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
            {title}
          </h1>
          <div className="w-20 h-1 bg-black dark:bg-white mt-6"></div>
        </div>

        {/* Content */}
        <div className="space-y-12 text-base leading-relaxed">
          {/* Intro */}
          <section className="space-y-4">
            <p className="text-lg opacity-80">
              {lang === "en" &&
                'Please read the text of this Public Offer Agreement (hereinafter – the "Agreement"). If you do not agree with any of its clauses or do not understand any clause, we recommend that you refrain from purchasing the goods.'}
              {lang === "de" &&
                'Bitte lesen Sie den Text dieses Vertrags des öffentlichen Angebots (nachfolgend – der „Vertrag“). Wenn Sie mit einer seiner Bestimmungen nicht einverstanden sind oder eine Bestimmung nicht verstehen, empfehlen wir Ihnen, vom Kauf der Waren abzusehen.'}
              {lang === "uk" &&
                "Прочитайте текст цього Договору публічної оферти, надалі – \"Договір\", і якщо Ви не згодні з яким-небудь його пунктом, чи не зрозуміли будь-який пункт Договору, пропонуємо Вам відмовитися від купівлі товару."}
            </p>
            <p className="opacity-80">
              {lang === "en"
                ? "By accepting the terms of the Agreement, you confirm that you agree with all of its provisions and that all clauses are clear to you."
                : lang === "de"
                ? "Mit der Annahme der Bestimmungen dieses Vertrags bestätigen Sie, dass Sie mit allen seinen Bedingungen einverstanden sind und dass Ihnen sämtliche Regelungen verständlich sind."
                : "У випадку прийняття умов Договору, Ви погоджуєтеся з усіма його умовами і підтверджуєте, що Вам зрозумілі всі його положення."}
            </p>
            <p className="opacity-80">
              {lang === "en"
                ? 'This Agreement is a public offer, is equivalent to an "oral agreement" and, in accordance with the current legislation of Ukraine, has full legal force.'
                : lang === "de"
                ? 'Diese Vereinbarung stellt ein öffentliches Angebot dar, ist einem „mündlichen Vertrag“ gleichgestellt und besitzt gemäß der geltenden Gesetzgebung der Ukraine volle Rechtskraft.'
                : 'Ця угода носить характер публічної оферти, є еквівалентом "усної угоди" і відповідно до чинного законодавства України має належну юридичну силу.'}
            </p>
          </section>

          {/* Definitions */}
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              {lang === "en"
                ? "Definitions"
                : lang === "de"
                ? "Begriffsbestimmungen"
                : "Визначення термінів"}
            </h2>
            <div className="space-y-4">
              <div className="p-5 border border-black/10 dark:border-white/10 rounded-lg space-y-2">
                <p className="font-semibold">
                  {lang === "en" ? "Website" : lang === "de" ? "Website" : "Сайт"}
                </p>
                <p className="text-sm opacity-70">
                  {lang === "en"
                    ? "The website hosted on the Internet at: https://chars.com, including all of its web pages."
                    : lang === "de"
                    ? "Die Website, die im Internet unter der Adresse https://chars.com erreichbar ist, einschließlich aller ihrer Unterseiten."
                    : "Веб-сайт, що розміщений в мережі Інтернет за адресою: https://chars.com, включаючи всі його веб-сторінки."}
                </p>
              </div>
              <div className="p-5 border border-black/10 dark:border-white/10 rounded-lg space-y-2">
                <p className="font-semibold">
                  {lang === "en" ? "Goods" : lang === "de" ? "Ware" : "Товар"}
                </p>
                <p className="text-sm opacity-70">
                  {lang === "en"
                    ? "The products whose images and/or descriptions are placed on the Website."
                    : lang === "de"
                    ? "Die Waren, deren Abbildungen und/oder Beschreibungen auf der Website veröffentlicht sind."
                    : "Товари, зображення та/або опис яких розміщено на Сайті."}
                </p>
              </div>
              <div className="p-5 border border-black/10 dark:border-white/10 rounded-lg space-y-2">
                <p className="font-semibold">
                  {lang === "en"
                    ? "Public offer"
                    : lang === "de"
                    ? "Öffentliches Angebot"
                    : "Публічна оферта"}
                </p>
                <p className="text-sm opacity-70">
                  {lang === "en"
                    ? "A public proposal of the Seller addressed to an indefinite circle of persons concerning the conclusion of a contract of sale of Goods."
                    : lang === "de"
                    ? "Ein an einen unbestimmten Personenkreis gerichtetes öffentliches Angebot des Verkäufers über den Abschluss eines Kaufvertrags über Waren."
                    : "Спрямована невизначеному колу осіб публічна пропозиція Продавця, що стосується укладення договору купівлі-продажу Товарів."}
                </p>
              </div>
              <div className="p-5 border border-black/10 dark:border-white/10 rounded-lg space-y-2">
                <p className="font-semibold">
                  {lang === "en"
                    ? "User / Buyer"
                    : lang === "de"
                    ? "Nutzer / Käufer"
                    : "Користувач/Покупець"}
                </p>
                <p className="text-sm opacity-70">
                  {lang === "en"
                    ? "A person who views information on the Website and/or orders and/or receives Goods."
                    : lang === "de"
                    ? "Eine Person, die Informationen auf der Website betrachtet und/oder Waren bestellt bzw. erhält."
                    : "Особа, що переглядає інформацію на Сайті та/або замовляє, та/або отримує Товари."}
                </p>
              </div>
              <div className="p-5 border border-black/10 dark:border-white/10 rounded-lg space-y-2">
                <p className="font-semibold">
                  {lang === "en" ? "Order" : lang === "de" ? "Bestellung" : "Замовлення"}
                </p>
                <p className="text-sm opacity-70">
                  {lang === "en"
                    ? "A duly completed and submitted request of the User to purchase selected Goods."
                    : lang === "de"
                    ? "Eine ordnungsgemäß ausgefüllte und aufgegebene Anfrage des Nutzers über den Kauf der von ihm ausgewählten Waren."
                    : "Належним чином оформлений та розміщений запит Користувача на здійснення купівлі обраних ним Товарів."}
                </p>
              </div>
            </div>
          </section>

          {/* 1. General provisions */}
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              {lang === "en"
                ? "1. General provisions"
                : lang === "de"
                ? "1. Allgemeine Bestimmungen"
                : "1. Загальні положення"}
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">
                  {lang === "en"
                    ? "This Agreement is a public offer; its terms are identical for all Users/Buyers regardless of their status."
                    : lang === "de"
                    ? "Dieser Vertrag ist ein öffentliches Angebot; seine Bedingungen sind für alle Nutzer/Käufer unabhängig von deren Status gleich."
                    : "Цей Договір є договором публічної оферти, його умови однакові для всіх Користувачів/Покупців незалежно від статусу."}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">
                  {lang === "en"
                    ? "By accepting the terms of this Agreement, i.e. the Seller’s Public Offer, the User becomes a Buyer."
                    : lang === "de"
                    ? "Mit der Annahme der Bedingungen dieses Vertrags, d. h. des öffentlichen Angebots des Verkäufers, wird der Nutzer zum Käufer."
                    : "У разі прийняття умов цього Договору, тобто Публічної оферти Продавця, Користувач стає Покупцем."}
                </span>
              </li>
            </ul>
          </section>

          {/* 2. Subject */}
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              {lang === "en"
                ? "2. Subject of the Agreement"
                : lang === "de"
                ? "2. Vertragsgegenstand"
                : "2. Предмет договору"}
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">
                  {lang === "en"
                    ? "The Seller undertakes to transfer the Goods into the Buyer’s ownership, and the Buyer undertakes to pay for and accept the Goods under the terms of this Agreement."
                    : lang === "de"
                    ? "Der Verkäufer verpflichtet sich, die Ware in das Eigentum des Käufers zu übertragen, und der Käufer verpflichtet sich, die Ware zu bezahlen und gemäß den Bedingungen dieses Vertrags anzunehmen."
                    : "Продавець зобов'язується передати у власність Покупцеві Товар, а Покупець зобов'язується оплатити та прийняти Товар на умовах цього Договору."}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">
                  {lang === "en"
                    ? "The Agreement applies to all types of Goods and services presented on the Website."
                    : lang === "de"
                    ? "Der Vertrag erstreckt sich auf alle Arten von Waren und Dienstleistungen, die auf der Website präsentiert werden."
                    : "Договір поширюється на всі види Товарів і послуг, що представлені на Сайті."}
                </span>
              </li>
            </ul>
          </section>

          {/* 3. Ordering procedure */}
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              {lang === "en"
                ? "3. Ordering procedure"
                : lang === "de"
                ? "3. Bestellvorgang"
                : "3. Порядок оформлення Замовлення"}
            </h2>
            <div className="space-y-3">
              <p className="opacity-80">
                {lang === "en"
                  ? "The product photos show one or more types of Goods of a particular article and textual information about the article, available sizes and price."
                  : lang === "de"
                  ? "Die dargestellten Produktfotos zeigen ein oder mehrere Warenmodelle eines bestimmten Artikels sowie Textinformationen zum Artikel, zu verfügbaren Größen und zum Preis."
                  : "Представлені фото-зразки містять один або більше видів Товару певного артикулу та текстову інформацію про артикул, доступні розміри, ціну."}
              </p>
              <p className="opacity-80">
                {lang === "en"
                  ? "The information posted on the Website is for informational purposes only."
                  : lang === "de"
                  ? "Die auf der Website veröffentlichten Informationen dienen ausschließlich Informationszwecken."
                  : "Відомості, розміщені на сайті мають виключно інформативний характер."}
              </p>
              <p className="opacity-80">
                {lang === "en"
                  ? "The User/Buyer shall independently place an Order for any Goods available for ordering on the Website."
                  : lang === "de"
                  ? "Der Nutzer/ Käufer stellt selbstständig eine Bestellung für jede auf der Website verfügbare Ware zusammen."
                  : "Користувач/Покупець має самостійно оформити Замовлення на будь-який Товар, який є доступним для замовлення на Сайті."}
              </p>
              <p className="opacity-80">
                {lang === "en"
                  ? "If the ordered Goods are not available, the Seller has the right to exclude the relevant Goods from the Order."
                  : lang === "de"
                  ? "Ist die bestellte Ware nicht vorrätig, ist der Verkäufer berechtigt, die entsprechende Ware aus der Bestellung zu streichen."
                  : "У разі відсутності замовленого Товару, Продавець має право виключити зазначений Товар із Замовлення."}
              </p>
            </div>
          </section>

          {/* 4. Price and payment */}
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              {lang === "en"
                ? "4. Price and payment procedure"
                : lang === "de"
                ? "4. Preis und Zahlungsbedingungen"
                : "4. Ціна і порядок оплати"}
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">
                  {lang === "en"
                    ? "The price of each Goods item is determined by the Seller and indicated on the Website."
                    : lang === "de"
                    ? "Der Preis jedes einzelnen Warenartikels wird vom Verkäufer festgelegt und auf der Website angegeben."
                    : "Ціна кожного окремого Товару визначається Продавцем і вказується на Сайті."}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">
                  {lang === "en"
                    ? "The total price of the Agreement equals the price of the Order. The total amount of the Order may change depending on the price, quantity or assortment of Goods."
                    : lang === "de"
                    ? "Der Gesamtpreis des Vertrags entspricht dem Bestellwert. Der Bestellbetrag kann sich in Abhängigkeit vom Preis, von der Menge oder vom Sortiment der Waren ändern."
                    : "Ціна Договору дорівнює ціні Замовлення. Сума Замовлення може змінюватися в залежності від ціни, кількості або номенклатури Товару."}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">
                  {lang === "en"
                    ? "The Buyer pays for the Goods according to the Order. The Buyer independently chooses one of the available payment methods: cash or non‑cash payment."
                    : lang === "de"
                    ? "Der Käufer bezahlt die Ware gemäß der Bestellung. Der Käufer wählt selbstständig eine der verfügbaren Zahlungsarten: Barzahlung oder unbare Zahlung."
                    : "Покупець здійснює оплату Товару згідно Замовлення. Покупець самостійно вибирає один з таких способів оплати: готівковий розрахунок або безготівковий розрахунок."}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">
                  {lang === "en"
                    ? "Payment for Goods is made exclusively in Ukrainian hryvnia (UAH)."
                    : lang === "de"
                    ? "Die Bezahlung der Waren erfolgt ausschließlich in ukrainischen Hrywnja (UAH)."
                    : "Оплата Товару здійснюється виключно у гривні."}
                </span>
              </li>
            </ul>
          </section>

          {/* 5. Delivery */}
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              {lang === "en"
                ? "5. Delivery of Goods"
                : lang === "de"
                ? "5. Lieferung der Ware"
                : "5. Доставка Товару"}
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">
                  {lang === "en"
                    ? "Delivery is carried out by the Seller or delivery services throughout the territory of Ukraine at the Buyer’s expense."
                    : lang === "de"
                    ? "Die Lieferung erfolgt durch den Verkäufer oder Kurierdienste innerhalb der Ukraine auf Kosten des Käufers."
                    : "Доставка виконується силами Продавця або службами доставки по території України за рахунок Покупця."}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">
                  {lang === "en"
                    ? "The overall delivery time consists of the order processing time and the delivery time. Order processing time is from one to three business days."
                    : lang === "de"
                    ? "Die Gesamtlieferzeit setzt sich aus der Bearbeitungszeit der Bestellung und der Lieferzeit zusammen. Die Bearbeitungszeit beträgt in der Regel ein bis drei Werktage."
                    : "Загальний термін доставки Товару складається з терміну обробки Замовлення і строку доставки. Термін обробки Замовлення – від одного робочого дня до трьох."}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">
                  {lang === "en"
                    ? "Upon receipt of the Goods, the Recipient is obliged to check the Goods in terms of quantity, quality, assortment and completeness."
                    : lang === "de"
                    ? "Bei Erhalt der Ware ist der Empfänger verpflichtet, die Ware hinsichtlich Menge, Qualität, Sortiment und Vollständigkeit zu prüfen."
                    : "При отриманні Товару Одержувач зобов'язаний перевірити Товар за кількістю, якістю, асортиментом та комплектністю."}
                </span>
              </li>
            </ul>
          </section>

          {/* 6. Returns */}
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              {lang === "en"
                ? "6. Return of Goods"
                : lang === "de"
                ? "6. Rückgabe der Ware"
                : "6. Повернення Товару"}
            </h2>
            <div className="p-5 border border-black/10 dark:border-white/10 rounded-lg space-y-3">
              <p className="opacity-80">
                {lang === "en"
                  ? "The return of Goods of proper quality is carried out in accordance with the Law of Ukraine “On Consumer Rights Protection”."
                  : lang === "de"
                  ? "Die Rückgabe von Waren in einwandfreiem Zustand erfolgt gemäß dem Gesetz der Ukraine „Über den Schutz der Verbraucherrechte“."
                  : "Повернення Товару належної якості здійснюється відповідно до Закону України «Про захист прав споживачів»."}
              </p>
              <p className="opacity-80">
                {lang === "en"
                  ? "The Buyer has the right to refuse the delivered Goods of proper quality within 14 (fourteen) days from the moment of receipt of the Goods, provided that the product appearance, consumer properties, factory packaging, labels and the payment document are preserved."
                  : lang === "de"
                  ? "Der Käufer hat das Recht, innerhalb von 14 (vierzehn) Tagen ab Erhalt der Ware die Annahme von Waren in einwandfreiem Zustand zu verweigern, sofern das Warenbild, die Gebrauchseigenschaften, die Originalverpackung, Etiketten und der Zahlungsbeleg erhalten geblieben sind."
                  : "Покупець має право відмовитися від поставленого Товару належної якості протягом 14 (чотирнадцяти) днів з моменту отримання Товару виключно за умови, що збережено товарний вид, споживчі властивості Товару, фабричну упаковку, ярлики та розрахунковий документ."}
              </p>
            </div>
          </section>

          {/* 7. Seller rights & obligations */}
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              {lang === "en"
                ? "7. Rights and obligations of the Seller"
                : lang === "de"
                ? "7. Rechte und Pflichten des Verkäufers"
                : "7. Права та обов'язки Продавця"}
            </h2>
            <div>
              <p className="font-semibold mb-3">
                {lang === "en"
                  ? "The Seller has the right to:"
                  : lang === "de"
                  ? "Der Verkäufer hat das Recht:"
                  : "Продавець має право:"}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 border-l-2 border-black/20 dark:border-white/20">
                  <p className="text-sm opacity-70">
                    {lang === "en"
                      ? "Unilaterally suspend the sale of Goods in case the User/Buyer violates the terms of this Agreement."
                      : lang === "de"
                      ? "Den Verkauf von Waren einseitig auszusetzen, wenn der Nutzer/Käufer die Bedingungen dieses Vertrags verletzt."
                      : "В односторонньому порядку призупинити продаж Товарів у випадку порушення Користувачем/Покупцем умов"}
                  </p>
                </div>
                <div className="p-4 border-l-2 border-black/20 dark:border-white/20">
                  <p className="text-sm opacity-70">
                    {lang === "en"
                      ? "Change the price of the Goods at its own discretion."
                      : lang === "de"
                      ? "Den Preis der Waren nach eigenem Ermessen zu ändern."
                      : "На власний розсуд змінювати ціну на Товари"}
                  </p>
                </div>
                <div className="p-4 border-l-2 border-black/20 dark:border-white/20 md:col-span-2">
                  <p className="text-sm opacity-70">
                    {lang === "en"
                      ? "If the ordered Goods are not available, exclude the relevant Goods from the Order."
                      : lang === "de"
                      ? "Bei Nichtverfügbarkeit der bestellten Ware die entsprechende Ware aus der Bestellung zu streichen."
                      : "У разі відсутності замовлених Товарів, виключити зазначений Товар із Замовлення"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 8. Buyer rights & obligations */}
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              {lang === "en"
                ? "8. Rights and obligations of the Buyer"
                : lang === "de"
                ? "8. Rechte und Pflichten des Käufers"
                : "8. Права та обов'язки Покупця"}
            </h2>
            <div className="space-y-6">
              <div>
                <p className="font-semibold mb-3">
                  {lang === "en"
                    ? "The User/Buyer has the right to:"
                    : lang === "de"
                    ? "Der Nutzer/Käufer hat das Recht:"
                    : "Користувач/Покупець має право:"}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 border-l-2 border-black/20 dark:border-white/20">
                    <p className="text-sm opacity-70">
                      {lang === "en"
                        ? "Choose Goods, place and submit Orders."
                        : lang === "de"
                        ? "Waren auszuwählen, Bestellungen zu erstellen und abzusenden."
                        : "Обрати Товари, оформлювати та направляти Замовлення"}
                    </p>
                  </div>
                  <div className="p-4 border-l-2 border-black/20 dark:border-white/20">
                    <p className="text-sm opacity-70">
                      {lang === "en"
                        ? "Demand that the Seller fulfil its obligations under this Agreement."
                        : lang === "de"
                        ? "Vom Verkäufer die Erfüllung seiner Verpflichtungen gemäß diesem Vertrag zu verlangen."
                        : "Вимагати від Продавця виконання умов та обов'язків"}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <p className="font-semibold mb-3">
                  {lang === "en"
                    ? "The User/Buyer undertakes to:"
                    : lang === "de"
                    ? "Der Nutzer/Käufer verpflichtet sich:"
                    : "Користувач/Покупець зобов'язується:"}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 border-l-2 border-black/20 dark:border-white/20">
                    <p className="text-sm opacity-70">
                      {lang === "en"
                        ? "Duly pay for and accept the completed Order."
                        : lang === "de"
                        ? "Die erstellte Bestellung ordnungsgemäß zu bezahlen und die Ware anzunehmen."
                        : "Належним чином оплатити та отримати оформлене Замовлення"}
                    </p>
                  </div>
                  <div className="p-4 border-l-2 border-black/20 dark:border-white/20">
                    <p className="text-sm opacity-70">
                      {lang === "en"
                        ? "Provide the Seller with complete and accurate information necessary for order delivery."
                        : lang === "de"
                        ? "Dem Verkäufer vollständige und zutreffende Informationen zur Verfügung zu stellen, die für die Lieferung der Bestellung erforderlich sind."
                        : "Надати Продавцю повну інформацію, що необхідна для здійснення доставки Замовлення"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 9. Term */}
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              {lang === "en"
                ? "9. Term of the Agreement"
                : lang === "de"
                ? "9. Laufzeit des Vertrags"
                : "9. Термін дії Договору"}
            </h2>
            <div className="p-5 border-l-4 border-black/30 dark:border-white/30">
              <p className="opacity-80">
                {lang === "en"
                  ? "This Agreement enters into force from the moment the Order is placed or the User/Buyer is registered on the Website and remains in effect until all obligations of the Parties are fulfilled."
                  : lang === "de"
                  ? "Dieser Vertrag tritt mit dem Zeitpunkt der Aufgabe der Bestellung oder der Registrierung des Nutzers/Käufers auf der Website in Kraft und gilt bis zur Erfüllung aller Verpflichtungen der Parteien."
                  : "Цей Договір набирає чинності з дня оформлення Замовлення або реєстрації Користувача/Покупця на Сайті і діє до виконання всіх умов Договору."}
              </p>
            </div>
          </section>

          {/* 10. Details */}
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              {lang === "en"
                ? "10. Company details"
                : lang === "de"
                ? "10. Unternehmensangaben"
                : "10. Реквізити"}
            </h2>
            <div className="bg-black/5 dark:bg-white/5 p-8 rounded-2xl border border-black/10 dark:border-white/10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold mb-2 opacity-60">
                    {lang === "en"
                      ? "Beneficiary"
                      : lang === "de"
                      ? "Empfänger"
                      : "Отримувач"}
                  </p>
                  <p className="text-sm opacity-90">
                    ФОП Романець Микола Миколайович
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2 opacity-60">
                    {lang === "en"
                      ? "Tax / Company ID"
                      : lang === "de"
                      ? "Steuernummer / Unternehmens‑ID"
                      : "ІПН/ЄДРПОУ"}
                  </p>
                  <p className="text-sm opacity-90">3357714797</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-semibold mb-2 opacity-60">IBAN</p>
                  <p className="text-sm opacity-90">
                    UA353220010000026007320071773
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2 opacity-60">
                    {lang === "en"
                      ? "Joint‑stock company (bank)"
                      : lang === "de"
                      ? "Aktiengesellschaft (Bank)"
                      : "Акціонерне товариство"}
                  </p>
                  <p className="text-sm opacity-90">УНІВЕРСАЛ БАНК</p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2 opacity-60">
                    {lang === "en" ? "MFO" : lang === "de" ? "MFO" : "МФО"}
                  </p>
                  <p className="text-sm opacity-90">322001</p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2 opacity-60">
                    {lang === "en"
                      ? "Bank EDRPOU"
                      : lang === "de"
                      ? "EDRPOU der Bank"
                      : "ЄДРПОУ Банку"}
                  </p>
                  <p className="text-sm opacity-90">21133352</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-16 pt-8 border-t border-black/10 dark:border-white/10">
            <p className="text-sm opacity-50">
              {lang === "en"
                ? "Last updated: 27 October 2025"
                : lang === "de"
                ? "Letzte Aktualisierung: 27. Oktober 2025"
                : "Дата останнього оновлення: 27 жовтня 2025 року"}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
