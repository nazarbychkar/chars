"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function PrivacyPolicyContent() {
  const { locale } = useI18n();
  const lang = locale === "en" || locale === "de" ? locale : "uk";

  const backToHomeLabel =
    lang === "en" ? "← Back to home" : lang === "de" ? "← Zur Startseite" : "← На головну";
  const title =
    lang === "en"
      ? "Privacy policy"
      : lang === "de"
      ? "Datenschutzerklärung"
      : "Політика конфіденційності";

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
                "This Privacy Policy (hereinafter – the Policy) applies to all information that the CHARS online store may receive about the User while using the online store website, its programs and products."}
              {lang === "de" &&
                "Diese Datenschutzerklärung (nachfolgend – die „Erklärung“) gilt für alle Informationen, die der Online‑Shop „CHARS“ über den Nutzer erhält, wenn dieser die Website des Online‑Shops, dessen Programme und Produkte nutzt."}
              {lang === "uk" &&
                "Ця Політика конфіденційності персональних даних (далі – Політика конфіденційності) діє щодо всієї інформації, яку Інтернет-магазин «CHARS», може отримати про Користувача під час використання сайту Інтернет-магазину, програм та продуктів Інтернет-магазину."}
            </p>
          </section>

          {/* 1. Definitions */}
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              {lang === "en"
                ? "1. Definitions"
                : lang === "de"
                ? "1. Begriffsbestimmungen"
                : "1. ВИЗНАЧЕННЯ ТЕРМІНІВ"}
            </h2>
            <p className="opacity-70">
              {lang === "en"
                ? "The following terms are used in this Privacy Policy:"
                : lang === "de"
                ? "In dieser Datenschutzerklärung werden folgende Begriffe verwendet:"
                : "У цій Політиці конфіденційності використовуються такі терміни:"}
            </p>
            <div className="space-y-5 mt-6">
              <div className="pl-6 border-l-2 border-black/10 dark:border-white/10">
                <p className="font-semibold mb-2">
                  {lang === "en"
                    ? "Administration of the online store website"
                    : lang === "de"
                    ? "Verwaltung der Website des Online‑Shops"
                    : "Адміністрація сайту Інтернет-магазину"}
                </p>
                <p className="opacity-70 text-sm">
                  {lang === "en"
                    ? "Authorised employees who manage the website on behalf of the online store, organise and carry out the processing of personal data, and determine the purposes of processing personal data, the composition of personal data to be processed and the actions (operations) performed with personal data."
                    : lang === "de"
                    ? "Die befugten Mitarbeiter, die im Namen des Online‑Shops die Website verwalten, die Verarbeitung personenbezogener Daten organisieren und durchführen sowie die Zwecke der Verarbeitung, den Umfang der zu verarbeitenden personenbezogenen Daten und die mit personenbezogenen Daten durchgeführten Handlungen (Vorgänge) festlegen."
                    : "Уповноважені співробітники на управління сайтом, що діють від імені інтернет-магазину, які організовують та здійснює обробку персональних даних, а також визначає цілі обробки персональних даних, склад персональних даних, що підлягають обробці, дії чи операції, що здійснюються з персональними даними."}
                </p>
              </div>
              <div className="pl-6 border-l-2 border-black/10 dark:border-white/10">
                <p className="font-semibold mb-2">
                  {lang === "en" ? "Personal data" : lang === "de" ? "Personenbezogene Daten" : "Персональні дані"}
                </p>
                <p className="opacity-70 text-sm">
                  {lang === "en"
                    ? "Any information relating directly or indirectly to an identified or identifiable natural person (data subject)."
                    : lang === "de"
                    ? "Alle Informationen, die sich direkt oder indirekt auf eine identifizierte oder identifizierbare natürliche Person (Betroffene) beziehen."
                    : "Будь-яка інформація, що відноситься до прямо чи опосередковано визначеної чи визначеної фізичної особи (суб'єкта персональних даних)."}
                </p>
              </div>
              <div className="pl-6 border-l-2 border-black/10 dark:border-white/10">
                <p className="font-semibold mb-2">
                  {lang === "en"
                    ? "Processing of personal data"
                    : lang === "de"
                    ? "Verarbeitung personenbezogener Daten"
                    : "Обробка персональних даних"}
                </p>
                <p className="opacity-70 text-sm">
                  {lang === "en"
                    ? "Any action (operation) or set of actions (operations) performed with or without the use of automation tools with personal data, including collection, recording, systematisation, accumulation, storage, clarification (updating, changing), extraction, use, transfer (distribution, provision, access), depersonalisation, blocking, deletion and destruction of personal data."
                    : lang === "de"
                    ? "Jede Handlung (Vorgang) oder jede Gesamtheit von Handlungen (Vorgängen), die mit oder ohne Hilfe automatisierter Verfahren mit personenbezogenen Daten durchgeführt werden, einschließlich Erhebung, Erfassung, Systematisierung, Speicherung, Anpassung oder Veränderung, Auslesung, Nutzung, Übermittlung (Verbreitung, Bereitstellung, Zugriff), Anonymisierung, Sperrung, Löschung und Vernichtung personenbezogener Daten."
                    : "Будь-яка дія (операція) або сукупність дій (операцій), що здійснюються з використанням засобів автоматизації або без використання таких засобів з персональними даними, включаючи збирання, записування, систематизацію, накопичення, зберігання, уточнення (оновлення, зміну), вилучення, використання, передачу (поширення, надання, доступ), знеособлення, блокування, видалення, знищення персональних даних."}
                </p>
              </div>
            </div>
          </section>

          {/* 2. General provisions */}
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              {lang === "en"
                ? "2. General provisions"
                : lang === "de"
                ? "2. Allgemeine Bestimmungen"
                : "2. ЗАГАЛЬНІ ПОЛОЖЕННЯ"}
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">
                  {lang === "en"
                    ? "By using the online store website, the User agrees to this Privacy Policy and the terms of processing of the User’s personal data."
                    : lang === "de"
                    ? "Durch die Nutzung der Website des Online‑Shops erklärt sich der Nutzer mit dieser Datenschutzerklärung und den Bedingungen für die Verarbeitung seiner personenbezogenen Daten einverstanden."
                    : "Використання Користувачем сайту Інтернет-магазину означає згоду з цією Політикою конфіденційності та умовами обробки персональних даних Користувача."}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">
                  {lang === "en"
                    ? "If the User disagrees with the terms of the Privacy Policy, they must stop using the online store website."
                    : lang === "de"
                    ? "Ist der Nutzer mit den Bedingungen dieser Datenschutzerklärung nicht einverstanden, muss er die Nutzung der Website des Online‑Shops einstellen."
                    : "У разі незгоди з умовами Політики конфіденційності Користувач повинен припинити використання веб-сайту Інтернет-магазину."}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">
                  {lang === "en"
                    ? "This Privacy Policy applies only to the online store website. The online store does not control and is not responsible for third‑party websites to which the User may navigate following links available on the online store website."
                    : lang === "de"
                    ? "Diese Datenschutzerklärung gilt ausschließlich für die Website des Online‑Shops. Der Online‑Shop kontrolliert keine Websites Dritter und ist nicht für Websites Dritter verantwortlich, zu denen der Nutzer über auf der Website platzierte Links gelangt."
                    : "Ця Політика конфіденційності застосовується лише до сайту Інтернет-магазину. Інтернет-магазин не контролює та не несе відповідальності за сайти третіх осіб, на які Користувач може перейти за посиланнями, доступними на сайті Інтернет-магазину."}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">
                  {lang === "en"
                    ? "The Administration of the website does not verify the accuracy of the personal data provided by the User of the online store website."
                    : lang === "de"
                    ? "Die Verwaltung der Website überprüft nicht die Richtigkeit der personenbezogenen Daten, die der Nutzer der Website des Online‑Shops zur Verfügung stellt."
                    : "Адміністрація сайту не перевіряє достовірність персональних даних, які надає Користувач сайту Інтернет-магазину."}
                </span>
              </li>
            </ul>
          </section>

          {/* 3. Subject */}
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              {lang === "en"
                ? "3. Subject of the Privacy Policy"
                : lang === "de"
                ? "3. Gegenstand der Datenschutzerklärung"
                : "3. ПРЕДМЕТ ПОЛІТИКИ КОНФІДЕНЦІЙНОСТІ"}
            </h2>
            <div className="space-y-4">
              <p className="opacity-80">
                {lang === "en"
                  ? "This Privacy Policy establishes the obligations of the Administration of the online store website to ensure the non‑disclosure and protection regime of the confidentiality of personal data that the User provides at the request of the Administration when registering on the online store website or when placing an order for the purchase of Goods."
                  : lang === "de"
                  ? "Diese Datenschutzerklärung legt die Verpflichtungen der Verwaltung der Website des Online‑Shops bezüglich der Nichtweitergabe und des Schutzes der Vertraulichkeit personenbezogener Daten fest, die der Nutzer auf Anfrage der Verwaltung bei der Registrierung auf der Website des Online‑Shops oder bei der Aufgabe einer Bestellung für Waren bereitstellt."
                  : "Ця Політика конфіденційності встановлює зобов'язання Адміністрації сайту інтернет-магазину щодо нерозголошення та забезпечення режиму захисту конфіденційності персональних даних, які Користувач надає на запит Адміністрації сайту при реєстрації на сайті інтернет-магазину або при оформленні замовлення на придбання Товару."}
              </p>
              <p className="opacity-80">
                {lang === "en"
                  ? "Personal data permitted for processing under this Privacy Policy is provided by the User by filling out registration forms on the online store website and includes the following information:"
                  : lang === "de"
                  ? "Personenbezogene Daten, deren Verarbeitung im Rahmen dieser Datenschutzerklärung zulässig ist, werden vom Nutzer durch das Ausfüllen der Registrierungsformulare auf der Website des Online‑Shops bereitgestellt und umfassen folgende Informationen:"
                  : "Персональні дані, дозволені для обробки в рамках цієї Політики конфіденційності, надаються Користувачем шляхом заповнення реєстраційної форми на Сайті інтернет-магазину та включають наступну інформацію:"}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <div className="p-4 border border-black/10 dark:border-white/10 rounded-lg">
                  <p className="text-sm opacity-70">
                    {lang === "en"
                      ? "Full name of the User"
                      : lang === "de"
                      ? "Vollständiger Name des Nutzers"
                      : "ПІБ Користувача"}
                  </p>
                </div>
                <div className="p-4 border border-black/10 dark:border-white/10 rounded-lg">
                  <p className="text-sm opacity-70">
                    {lang === "en"
                      ? "Contact phone number"
                      : lang === "de"
                      ? "Kontakttelefonnummer"
                      : "Контактний телефон"}
                  </p>
                </div>
                <div className="p-4 border border-black/10 dark:border-white/10 rounded-lg">
                  <p className="text-sm opacity-70">
                    {lang === "en"
                      ? "E‑mail address"
                      : lang === "de"
                      ? "E‑Mail‑Adresse"
                      : "E-mail адреса"}
                  </p>
                </div>
                <div className="p-4 border border-black/10 dark:border-white/10 rounded-lg">
                  <p className="text-sm opacity-70">
                    {lang === "en"
                      ? "Delivery address"
                      : lang === "de"
                      ? "Lieferadresse"
                      : "Адреса доставки"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Purposes */}
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              {lang === "en"
                ? "4. Purposes of collecting User’s personal information"
                : lang === "de"
                ? "4. Zwecke der Erhebung personenbezogener Daten des Nutzers"
                : "4. ЦІЛІ ЗБОРУ ПЕРСОНАЛЬНОЇ ІНФОРМАЦІЇ КОРИСТУВАЧА"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  uk: "Ідентифікація Користувача",
                  en: "Identification of the User",
                  de: "Identifizierung des Nutzers",
                },
                {
                  uk: "Надання персоналізованих ресурсів",
                  en: "Provision of personalised services and content",
                  de: "Bereitstellung personalisierter Inhalte und Services",
                },
                {
                  uk: "Встановлення зворотного зв'язку",
                  en: "Establishing feedback and communication",
                  de: "Herstellung der Kommunikation und Rückmeldung",
                },
                {
                  uk: "Підтвердження достовірності даних",
                  en: "Verification of data accuracy",
                  de: "Überprüfung der Richtigkeit der Daten",
                },
                {
                  uk: "Створення облікового запису",
                  en: "Creating a user account",
                  de: "Erstellung eines Benutzerkontos",
                },
                {
                  uk: "Повідомлення про стан Замовлення",
                  en: "Informing about order status",
                  de: "Benachrichtigung über den Bestellstatus",
                },
                {
                  uk: "Оброблення платежів",
                  en: "Processing of payments",
                  de: "Abwicklung von Zahlungen",
                },
                {
                  uk: "Клієнтська підтримка",
                  en: "Customer support",
                  de: "Kundensupport",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 border-l-2 border-black/20 dark:border-white/20"
                >
                  <p className="text-sm opacity-80">
                    {lang === "en" ? item.en : lang === "de" ? item.de : item.uk}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 5. Processing methods */}
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              {lang === "en"
                ? "5. Methods and terms of processing personal information"
                : lang === "de"
                ? "5. Methoden und Dauer der Verarbeitung personenbezogener Daten"
                : "5. СПОСОБИ ТА ТЕРМІНИ ОБРОБКИ ПЕРСОНАЛЬНОЇ ІНФОРМАЦІЇ"}
            </h2>
            <div className="space-y-4">
              <p className="opacity-80">
                {lang === "en"
                  ? "The User’s personal data is processed without any time limit and in any lawful manner."
                  : lang === "de"
                  ? "Die Verarbeitung personenbezogener Daten des Nutzers erfolgt zeitlich unbegrenzt auf jede gesetzlich zulässige Weise."
                  : "Обробка персональних даних Користувача здійснюється без обмеження строку будь-яким законним способом."}
              </p>
              <p className="opacity-80">
                {lang === "en"
                  ? "The User agrees that the Administration of the website has the right to transfer personal data to third parties, in particular courier services and postal organisations, solely for the purpose of fulfilling the User’s order."
                  : lang === "de"
                  ? "Der Nutzer erklärt sich damit einverstanden, dass die Verwaltung der Website personenbezogene Daten an Dritte – insbesondere Kurierdienste und Postdienstleister – ausschließlich zum Zweck der Ausführung der Bestellung übermitteln darf."
                  : "Користувач погоджується з тим, що Адміністрація сайту має право передавати персональні дані третім особам, зокрема кур'єрським службам, організаціям поштового зв'язку, виключно з метою виконання замовлення."}
              </p>
            </div>
          </section>

          {/* 6. Obligations */}
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              {lang === "en"
                ? "6. Obligations of the parties"
                : lang === "de"
                ? "6. Pflichten der Parteien"
                : "6. ОБОВ'ЯЗКИ СТОРІН"}
            </h2>
            <div className="space-y-6">
              <div>
                <p className="font-semibold mb-3">
                  {lang === "en"
                    ? "The User undertakes to:"
                    : lang === "de"
                    ? "Der Nutzer verpflichtet sich:"
                    : "Користувач зобов'язаний:"}
                </p>
                <ul className="space-y-2 opacity-70">
                  <li className="flex items-start gap-2">
                    <span>↪</span>
                    <span>
                      {lang === "en"
                        ? "Provide personal data necessary to use the Website."
                        : lang === "de"
                        ? "Personenbezogene Daten bereitzustellen, die für die Nutzung der Website erforderlich sind."
                        : "Надати інформацію про персональні дані, необхідну для користування Сайтом"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>↪</span>
                    <span>
                      {lang === "en"
                        ? "Update and supplement the provided personal data in case of any changes."
                        : lang === "de"
                        ? "Die bereitgestellten personenbezogenen Daten im Falle von Änderungen zu aktualisieren und zu ergänzen."
                        : "Оновити, доповнити надану інформацію про персональні дані у разі зміни даної інформації"}
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-3">
                  {lang === "en"
                    ? "The Administration of the website undertakes to:"
                    : lang === "de"
                    ? "Die Verwaltung der Website verpflichtet sich:"
                    : "Адміністрація сайту зобов'язана:"}
                </p>
                <ul className="space-y-2 opacity-70">
                  <li className="flex items-start gap-2">
                    <span>↪</span>
                    <span>
                      {lang === "en"
                        ? "Use the received information solely for the purposes specified in this Policy."
                        : lang === "de"
                        ? "Die erhaltenen Informationen ausschließlich für die in dieser Erklärung genannten Zwecke zu verwenden."
                        : "Використовувати отриману інформацію виключно для вказаних цілей"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>↪</span>
                    <span>
                      {lang === "en"
                        ? "Ensure that confidential information is kept secret."
                        : lang === "de"
                        ? "Die Vertraulichkeit der erhaltenen Informationen zu gewährleisten."
                        : "Забезпечити зберігання конфіденційної інформації в таємниці"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>↪</span>
                    <span>
                      {lang === "en"
                        ? "Take reasonable precautions to protect the confidentiality of personal data."
                        : lang === "de"
                        ? "Angemessene Maßnahmen zum Schutz der Vertraulichkeit personenbezogener Daten zu treffen."
                        : "Вживати запобіжних заходів для захисту конфіденційності персональних даних"}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 7. Details */}
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              {lang === "en"
                ? "7. Company details"
                : lang === "de"
                ? "7. Unternehmensangaben"
                : "7. РЕКВІЗИТИ"}
            </h2>
            <div className="bg-black/5 dark:bg:white/5 p-8 rounded-2xl border border-black/10 dark:border-white/10 space-y-6">
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

