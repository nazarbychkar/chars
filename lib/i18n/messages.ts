import type { Locale } from "./config";

type Messages = {
  common: {
    backToHome: string;
    loading: string;
    noResults: string;
    notFoundTitle: string;
    notFoundDescription: string;
    notFoundCatalog: string;
    notFoundHint: string;
    searchPlaceholder: string;
    searchHint: string;
  };
  header: {
    info: string;
    about: string;
    paymentAndDelivery: string;
    reviews: string;
    contacts: string;
    menuLabel: string;
    themeToggleAriaLight: string;
    themeToggleAriaDark: string;
    searchOpenAria: string;
    basketOpenAria: (count: number) => string;
    basketCountAria: (count: number) => string;
    seasonCategory: string;
    collections: string;
    seasonSpring: string;
    seasonSummer: string;
    seasonAutumn: string;
    seasonWinter: string;
    goToCategoryAria: (name: string) => string;
    currencyLabel: string;
    languageLabel: string;
    langSwitcherAria: string;
    certificates: string;
    catalogMenu: string;
    viewAllCategory: string;
  };
  collections: {
    title: string;
    subtitle: string;
    chooseSeason: string;
    viewCollection: string;
  };
  footer: {
    showroomAddressLabel: string;
    showroomAddressValue: string;
    workingHoursTitle: string;
    workingHoursValue: string;
    phoneTitle: string;
    navigationTitle: string;
    navigationAbout: string;
    navigationPaymentAndDelivery: string;
    navigationReviews: string;
    navigationContacts: string;
    privacyPolicy: string;
    termsOfService: string;
    purchaseInParts: string;
    devCredit: string;
    designCredit: string;
  };
  home: {
    limitedTitle: string;
    limitedSubtitle: string;
    topSaleTitle: string;
    topSaleSubtitle: string;
    heroCatalogButton: string;
    aboutTitle: string;
    aboutText: string;
    faqTitleLine1: string;
    faqTitleLine2: string;
    faqSubtitleLine1: string;
    faqSubtitleLine2: string;
    faqItems: {
      number: string;
      title: string;
      contentIntro: string;
      contentBody: string;
    }[];
    reviewsTitleLine1: string;
    reviewsTitleLine2: string;
    reviewsSubtitle: string;
    whyChooseUsTitle: string;
    whyChooseUsSubtitle: string;
    whyChooseUsItems: {
      top: string;
      bottom: string;
    }[];
    socialTitleLine1: string;
    socialTitleLine2: string;
    socialSubtitle: string;
    socialTikTok: string;
    socialInstagram: string;
  };
  checkout: {
    title: string;
    emptyTitle: string;
    continueShopping: string;
    fillAllFieldsTitle: string;
    customerDataTitle: string;
    totalLabel: string;
    summaryThankYouLine1: string;
    summaryThankYouLine2: string;
    summaryNameLabel: string;
    summaryEmailLabel: string;
    summaryPhoneLabel: string;
    summaryCityLabel: string;
    summaryPostOfficeLabel: string;
    summaryCommentLabel: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    deliveryMethodLabel: string;
    deliveryMethodPlaceholder: string;
    deliveryOptionNpBranch: string;
    deliveryOptionNpLocker: string;
    deliveryOptionNpCourier: string;
    deliveryOptionShowroom: string;
    cityLabel: string;
    cityCourierLabel: string;
    cityPlaceholder: string;
    citiesLoading: string;
    postOfficeLabel: string;
    postOfficeLockerLabel: string;
    postOfficePlaceholder: string;
    postOfficeLockerPlaceholder: string;
    postOfficesLoading: string;
    showroomInfo: string;
    addressLabel: string;
    addressPlaceholder: string;
    commentLabel: string;
    commentPlaceholder: string;
    paymentMethodLabel: string;
    paymentMethodPlaceholder: string;
    paymentOptionFull: string;
    paymentOptionPrepay: string;
    paymentOptionPaypalFull: string;
    paymentOptionInstallments: string;
    paymentOptionInstallmentsHint: string;
    paymentTrustBadgesAria: string;
    submitSending: string;
    submitLabel: string;
    basketEmptyInline: string;
    itemColorLabel: string;
    itemQtyLabel: string;
    increaseQtyTitle: string;
    maxStockTitle: (stock: number) => string;
    countryLabel: string;
    countryOtherLabel: string;
    countryOtherPlaceholder: string;
    deliveryOptionInternational: string;
    postalCodeLabel: string;
    postalCodePlaceholder: string;
    internationalInfo: string;
    orderCreatedRedirecting: string;
    orderCreatedInstallments: string;
    paymentStatusTitle: string;
    paymentStatusDescription: string;
    paymentStatusInstallmentsDescription: string;
    errorRequiredFields: string;
    errorFullName: string;
    errorCartEmpty: string;
    errorGeneric: string;
    errorNoInvoice: string;
    errorNetwork: string;
    errorCitiesGeneric: string;
    errorCitiesNetwork: string;
    errorWarehousesGeneric: string;
    paymentSuccess: string;
    giftCertificateLabel: string;
    giftCertificatePlaceholder: string;
    giftCertificateApply: string;
    giftCertificateApplied: (code: string) => string;
    giftCertificateAppliedStatus: string;
    giftCertificateAppliedAmount: (amount: string, currency: string) => string;
    giftCertificateDiscountLabel: string;
    giftCertificateRemove: string;
    subtotalLabel: string;
  };
  basket: {
    title: string;
    empty: string;
    sizeLabel: string;
    checkoutButton: string;
    boughtWithThisTitle: string;
  };
  catalog: {
    allProductsLabel: string;
    filtersLabel: string;
    showMoreLabel: string;
    sidebarTitle: string;
    sortAccordionTitle: string;
    sortAscLabel: string;
    sortDescLabel: string;
    sizeAccordionTitle: string;
    colorAccordionTitle: string;
    priceAccordionTitle: string;
    minPriceLabel: string;
    maxPriceLabel: string;
    minPricePlaceholder: string;
    maxPricePlaceholder: string;
    colorNames: Record<string, string>;
  };
  product: {
    inStockLabel: string;
    chooseSizeLabel: string;
    sizeGuideLabel: string;
    outOfStockLabel: string;
    colorLabel: string;
    addToCartLabel: string;
    contactManagerLabel: string;
    imagePlaceholder: string;
    sizeGuideTitle: string;
    sizeGuideSubtitle: string;
    sizeGuideSizeHeader: string;
    sizeGuideChestHeader: string;
    sizeGuideWaistHeader: string;
    sizeGuideHipsHeader: string;
    sizeGuideHeightHeader: string;
    toastAddedToCart: string;
    toastGoToCheckout: string;
    descriptionTitle: string;
    fabricTitle: string;
    liningTitle: string;
    selectSizeError: string;
    selectColorError: string;
    productNotLoadedError: string;
    basketUnavailableError: string;
    noStockError: string;
    maxQuantityReachedError: (stock: number) => string;
    limitedQuantityAvailableError: (available: number, stock: number) => string;
    viewColorAria: (label: string) => string;
    recommendationsTitle: string;
    moreProductsLabel: string;
    comingSoonLabel: string;
  };
  certificate: {
    title: string;
    subtitle: string;
    availabilityLabel: string;
    chooseAmountLabel: string;
    buyButton: string;
    descriptionTitle: string;
    description: string;
    features: string[];
    alsoInUah: string;
    alsoInEur: string;
    previewBadge: string;
    previewCodeLabel: string;
    amountPrefix: string;
    previewTagline: string;
    previewValid: string;
    formTitle: string;
    formSubtitle: (amount: string) => string;
    nameLabel: string;
    namePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    submitButton: string;
    submitting: string;
    fillAllFields: string;
    redirecting: string;
    errorGeneric: string;
    paymentSuccessTitle: string;
    paymentSuccessDescription: string;
    paymentSuccessEmailHint: (email: string) => string;
    paymentSuccessOrderLabel: string;
    continueShopping: string;
    backToHome: string;
  };
  purchaseInParts: {
    title: string;
    subtitle: string;
    providerTitle: string;
    providerBody: string;
    productTitle: string;
    productItems: string[];
    highlightTitle: string;
    highlightBody: string;
    legalRate: string;
    legalBank: string;
    moreInfo: string;
  };
  admin?: {
    ordersFetchError: string;
    ordersGenericError: string;
  };
  breadcrumbs: {
    homeLabel: string;
    goToAria: (label: string) => string;
  };
};

type MessagesMap = Record<Locale, Messages>;

export const messages: MessagesMap = {
  uk: {
    common: {
      backToHome: "На головну",
      loading: "Завантаження...",
      noResults: "Нічого не знайдено",
      notFoundTitle: "Сторінку не знайдено",
      notFoundDescription:
        "Схоже, що сторінка, яку ви шукаєте, загубилася у просторах інтернету. Але не хвилюйтеся — у нас є багато інших цікавих речей!",
      notFoundCatalog: "Каталог товарів",
      notFoundHint: "Якщо ви вважаєте, що це помилка, будь ласка, зв'яжіться з нами",
      searchPlaceholder: "Пошук...",
      searchHint: "Введіть запит, щоб знайти товари.",
    },
    header: {
      info: "ІНФО",
      about: "Про нас",
      paymentAndDelivery: "Оплата і доставка",
      reviews: "Відгуки",
      contacts: "Контакти",
      menuLabel: "Меню",
      themeToggleAriaLight: "Увімкнути світлу тему",
      themeToggleAriaDark: "Увімкнути темну тему",
      searchOpenAria: "Відкрити пошук",
      basketOpenAria: (count) => `Відкрити кошик. Товарів в кошику: ${count}`,
      basketCountAria: (count) => `${count} товарів в кошику`,
      seasonCategory: "Сезон",
      collections: "Колекції",
      seasonSpring: "Весна",
      seasonSummer: "Літо",
      seasonAutumn: "Осінь",
      seasonWinter: "Зима",
      goToCategoryAria: (name) => `Перейти до категорії ${name}`,
      currencyLabel: "Валюта",
      languageLabel: "Мова",
      langSwitcherAria: "Змінити мову сайту",
      certificates: "Сертифікати",
      catalogMenu: "Каталог",
      viewAllCategory: "Усі товари",
    },
    collections: {
      title: "Колекції",
      subtitle: "Оберіть сезон — і відкрийте речі, зібрані під настрій і погоду.",
      chooseSeason: "Обрати сезон",
      viewCollection: "Дивитись колекцію",
    },
    footer: {
      showroomAddressLabel: "Адреса шоуруму:",
      showroomAddressValue: "Київ, вул. Костянтинівська, 21",
      workingHoursTitle: "Графік роботи",
      workingHoursValue: "Пн-Пт 13:00-19:00",
      phoneTitle: "Телефон",
      navigationTitle: "Навігація",
      navigationAbout: "Про нас",
      navigationPaymentAndDelivery: "Оплата і доставка",
      navigationReviews: "Відгуки",
      navigationContacts: "Контакти",
      privacyPolicy: "Політика конфіденційності",
      termsOfService: "Договір оферти",
      purchaseInParts: "Покупка частинами",
      devCredit: "Telebots | Розробка сайтів",
      designCredit: "Sviat | Дизайн сайту",
    },
    home: {
      limitedTitle: "Лімітована колекція від CHARS",
      limitedSubtitle:
        "Лімітована колекція — для тих кому важлива унікальність.",
      topSaleTitle: "Топ продажів | CHARS",
      topSaleSubtitle: "Улюблені образи наших клієнтів.",
      heroCatalogButton: "Каталог",
      aboutTitle: "Про нас",
      aboutText:
        "CHARS — український бренд чоловічого одягу, заснований у серпні 2023 року в Києві.\nМи з’явилися під час війни, коли майбутнє було невизначеним, але мрії залишалися сильними.\nШиємо те, що самі хочемо носити — без компромісів.\nУ власному цеху контролюємо кожен етап виробництва, поєднуючи смарт-кежуал, кежуал-класик і трохи спорту.\nСтворюємо одяг для різних чоловіків — стриманих і сміливих, класичних і нестандартних.\nРізні, але справжні.",
      faqTitleLine1: "Ви часто",
      faqTitleLine2: "запитуєте",
      faqSubtitleLine1: "Зібрали найпоширеніші",
      faqSubtitleLine2: "запитання наших відвідувачів",
      faqItems: [
        {
          number: "01",
          title: "Оплата | CHARS KYIV",
          contentIntro: "Оплата за готові вироби та індивідуальні замовлення",
          contentBody:
            "Для готових виробів з наявності ми приймаємо:\n— Передплату 300 грн (після підтвердження наявності товару)\n— Повну оплату\n— Покупку частинами monobank (без переплат і комісій для покупця).\n\nДля індивідуальних замовлень та виробів з корегуванням параметрів (довжина, талія тощо) потрібна 100% оплата перед початком роботи.\n\nДетальні умови Покупки частинами — на сторінці «Покупка частинами» (у футері сайту).\n\nУсі деталі щодо оплати ми уточнюємо з вами особисто після оформлення замовлення.",
        },
        {
          number: "02",
          title: "Доставка | CHARS KYIV",
          contentIntro: "Доставка по Україні та самовивіз із шоуруму",
          contentBody:
            "Доставка по Україні здійснюється службою «Нова пошта» у відділення, поштомат або курʼєром за адресою.\n\nТакож ви можете забрати замовлення самостійно у шоурумі CHARS у Києві (вул. Костянтинівська, 21) у години роботи.\n\nТочні строки та вартість доставки ми узгоджуємо з вами після оформлення замовлення.",
        },
        {
          number: "03",
          title: "Повернення | CHARS KYIV",
          contentIntro: "Повернення та обмін виробів",
          contentBody:
            "Повернення товару належної якості можливе згідно із чинним законодавством України за умови збереження товарного вигляду, бірок та відсутності слідів носіння.\n\nІндивідуальні вироби (з корекцією параметрів або пошиті за вашими мірками) поверненню не підлягають, окрім випадків виробничого браку.",
        },
        {
          number: "04",
          title: "Відправка замовлення | CHARS KYIV",
          contentIntro: "Терміни обробки та відправки замовлень",
          contentBody:
            "Обробка та комплектація замовлення зазвичай займає 1–3 робочі дні після підтвердження та оплати.\n\nПісля відправки ми надсилаємо вам номер ТТН «Нової пошти» в месенджер або SMS, щоб ви могли відстежувати посилку.",
        },
      ],
      reviewsTitleLine1: "Враження",
      reviewsTitleLine2: "наших клієнтів",
      reviewsSubtitle: "Більше відгуків дивіться у нашому Instagram профілі",
      whyChooseUsTitle: "Чому обирають нас",
      whyChooseUsSubtitle: "Chars — коли естетика не потребує зайвих слів.",
      whyChooseUsItems: [
        {
          top: "Власне виробництво",
          bottom: "Ми контролюємо кожен етап — від викрійки до останнього стібка.",
        },
        {
          top: "Пошиття під індивідуальні параметри",
          bottom: "Ми не створюємо \"середньостатистичний\" одяг — ми створюємо твій.",
        },
        {
          top: "Створення образу за 24 години",
          bottom: "У нас немає \"довгого очікування\" — є уважність до твого часу.",
        },
        {
          top: "Якість котру відчуваєш",
          bottom: "Кожен виріб проходить через руки майстра, а не лише машину.",
        },
        {
          top: "Локальний український бренд",
          bottom:
            "Ми підтримуємо локальне виробництво, чесну працю та створюємо речі, які говорять тихо, але точно.",
        },
      ],
      socialTitleLine1: "Ми ближче,",
      socialTitleLine2: "ніж здається!",
      socialSubtitle:
        "Лімітована колекція — для тих кому важлива унікальність.",
      socialTikTok: "МИ В TIKTOK",
      socialInstagram: "МИ В ІНСТАГРАМ",
    },
    breadcrumbs: {
      homeLabel: "Головна",
      goToAria: (label) => `Перейти до ${label}`,
    },
    checkout: {
      title: "Заповніть всі поля",
      emptyTitle: "Ваш кошик порожній",
      continueShopping: "Продовжити покупки",
      fillAllFieldsTitle: "Заповніть всі поля",
      customerDataTitle: "Дані клієнта",
      totalLabel: "Всього",
      summaryThankYouLine1: "Дякуємо за",
      summaryThankYouLine2: "ваше замовлення!",
      summaryNameLabel: "Ім'я:",
      summaryEmailLabel: "Email:",
      summaryPhoneLabel: "Телефон:",
      summaryCityLabel: "Місто:",
      summaryPostOfficeLabel: "Відділення:",
      summaryCommentLabel: "Коментар:",
      nameLabel: "Ім'я та прізвище",
      namePlaceholder: "Ваше імʼя та прізвище",
      emailLabel: "Email",
      emailPlaceholder: "Ваш Email",
      phoneLabel: "Телефон",
      phonePlaceholder: "Ваш телефон (наприклад: +380501234567)",
      deliveryMethodLabel: "Спосіб доставки *",
      deliveryMethodPlaceholder: "Оберіть спосіб доставки",
      deliveryOptionNpBranch: "Нова пошта — у відділення",
      deliveryOptionNpLocker: "Нова пошта — у поштомат",
      deliveryOptionNpCourier: "Нова пошта — кур’єром",
      deliveryOptionShowroom: "Самовивіз з шоуруму (13:00–19:00)",
      cityLabel: "Місто *",
      cityCourierLabel: "Місто для доставки кур’єром *",
      cityPlaceholder: "Введіть назву міста",
      citiesLoading: "Завантаження міст...",
      postOfficeLabel: "Відділення *",
      postOfficeLockerLabel: "Поштомат *",
      postOfficePlaceholder: "Введіть назву відділення",
      postOfficeLockerPlaceholder: "Введіть назву поштомата",
      postOfficesLoading: "Завантаження відділень...",
      showroomInfo:
        "Самовивіз з шоуруму з 13:00 до 19:00, Київ, вул. Костянтинівська, 21",
      addressLabel: "Адреса доставки (вулиця, будинок, квартира) *",
      addressPlaceholder: "Напр.: вул. Січових Стрільців, 10, кв. 25",
      commentLabel: "Коментар",
      commentPlaceholder: "Ваш коментар",
      paymentMethodLabel: "Оберіть зручну для вас систему оплати",
      paymentMethodPlaceholder: "Оберіть спосіб оплати",
      paymentOptionFull: "Plata by mono",
      paymentOptionPrepay: "Передоплата 300 ₴",
      paymentOptionPaypalFull: "PayPal",
      paymentOptionInstallments: "Покупка частинами monobank",
      paymentOptionInstallmentsHint: "Без переплат і комісій",
      paymentTrustBadgesAria: "Доступні способи оплати карткою",
      submitSending: "Відправка...",
      submitLabel: "Відправити",
      basketEmptyInline: "Ваш кошик порожній",
      itemColorLabel: "Колір",
      itemQtyLabel: "Кількість",
      increaseQtyTitle: "Збільшити кількість",
      maxStockTitle: (stock) =>
        `Максимальна кількість в наявності: ${stock} шт.`,
      countryLabel: "Країна *",
      countryOtherLabel: "Вкажіть країну *",
      countryOtherPlaceholder: "Наприклад: Germany, USA, Canada",
      deliveryOptionInternational: "Міжнародна доставка (worldwide)",
      postalCodeLabel: "Поштовий індекс *",
      postalCodePlaceholder: "ZIP / Поштовий індекс",
      internationalInfo:
        "Вартість та строки міжнародної доставки розраховуються за тарифами перевізника у вашій країні. Після оформлення замовлення ми зв’яжемося з вами, щоб узгодити службу доставки та точну вартість.",
      errorRequiredFields:
        "Будь ласка, заповніть усі необхідні поля, щоб ми змогли швидко обробити ваше замовлення ✨",
      errorFullName:
        "Будь ласка, введіть ваше ім'я та прізвище повністю — це допоможе нам швидше обробити замовлення 😊",
      errorCartEmpty:
        "Ваш кошик порожній. Додайте товари, які вам подобаються, і повертайтеся! 🛒",
      errorGeneric:
        "Нам шкода, але щось пішло не так. Будь ласка, спробуйте ще раз або зв'яжіться з нами — ми обов'язково допоможемо! 💪",
      errorNoInvoice:
        "На жаль, наразі ми не можемо створити посилання для оплати. Будь ласка, спробуйте через кілька хвилин або зв'яжіться з нашою службою підтримки.",
      errorNetwork:
        "Схоже, виникли проблеми з інтернет-з'єднанням. Будь ласка, перевірте підключення та спробуйте ще раз.",
      errorCitiesGeneric:
        "На жаль, наразі ми не можемо завантажити список міст. Будь ласка, спробуйте через кілька хвилин.",
      errorCitiesNetwork:
        "Виникла проблема при завантаженні списку міст. Будь ласка, перевірте підключення та спробуйте ще раз.",
      errorWarehousesGeneric:
        "На жаль, наразі ми не можемо завантажити список відділень. Будь ласка, спробуйте через кілька хвилин.",
      paymentSuccess:
        "✅ Оплата успішна! Ваше замовлення прийнято до обробки. Ми надішлемо вам SMS з номером відправлення після комплектування замовлення.",
      orderCreatedRedirecting:
        "Замовлення успішно створено! Переходимо до оплати...",
      orderCreatedInstallments:
        "Заявку створено! Відкрийте застосунок Monobank і підтвердіть покупку частинами.",
      paymentStatusTitle: "Перевірка статусу оплати...",
      paymentStatusDescription: "Будь ласка, зачекайте",
      paymentStatusInstallmentsDescription:
        "Підтвердіть оплату в застосунку Monobank. Сторінка оновиться автоматично після підтвердження.",
      giftCertificateLabel: "Подарунковий сертифікат",
      giftCertificatePlaceholder: "CHARS-XXXX-XXXX",
      giftCertificateApply: "Застосувати",
      giftCertificateApplied: (code) => `Сертифікат ${code} застосовано`,
      giftCertificateAppliedStatus: "Сертифікат застосовано",
      giftCertificateAppliedAmount: (amount, currency) =>
        `Знижка −${amount} ${currency}`,
      giftCertificateDiscountLabel: "Знижка сертифікатом",
      giftCertificateRemove: "Змінити код",
      subtotalLabel: "Проміжний підсумок",
    },
    basket: {
      title: "Кошик",
      empty: "Ваш кошик порожній",
      sizeLabel: "Розмір",
      checkoutButton: "Оформити замовлення",
      boughtWithThisTitle: "З цим товаром часто беруть",
    },
    catalog: {
      allProductsLabel: "Усі товари",
      filtersLabel: "Фільтри",
      showMoreLabel: "Показати ще",
      sidebarTitle: "Фільтрувати / Сортувати",
      sortAccordionTitle: "Сортувати за",
      sortAscLabel: "За зростанням ціни",
      sortDescLabel: "За спаданням ціни",
      sizeAccordionTitle: "Розмір",
      colorAccordionTitle: "Колір",
      priceAccordionTitle: "Вартість",
      minPriceLabel: "Мінімальна ціна",
      maxPriceLabel: "Максимальна ціна",
      minPricePlaceholder: "від",
      maxPricePlaceholder: "до",
      colorNames: {
        Бежевий: "Бежевий",
        Блакитний: "Блакитний",
        Білий: "Білий",
        Жовтий: "Жовтий",
        Зелений: "Зелений",
        Кораловий: "Кораловий",
        Коричневий: "Коричневий",
        Кремовий: "Кремовий",
        Малиновий: "Малиновий",
        Помаранчевий: "Помаранчевий",
        Рожевий: "Рожевий",
        "Світло-сірий": "Світло-сірий",
        Синій: "Синій",
        Сірий: "Сірий",
        "Темно-синій": "Темно-синій",
        "Темно-сірий": "Темно-сірий",
        Фіолетовий: "Фіолетовий",
        Хаки: "Хакі",
        Червоний: "Червоний",
        Чорний: "Чорний",
        Бордо: "Бордо",
        "Еко-шкіра": "Еко-шкіра",
        "Темно-синя": "Темно-синя",
      },
    },
    product: {
      inStockLabel: "В наявності",
      chooseSizeLabel: "Оберіть розмір",
      sizeGuideLabel: "Розмірна сітка",
      outOfStockLabel: "Немає в наявності",
      colorLabel: "Колір",
      addToCartLabel: "в кошик",
      contactManagerLabel: "Написати менеджеру",
      imagePlaceholder: "Фото товару",
      sizeGuideTitle: "РОЗМІРНА СІТКА",
      sizeGuideSubtitle: "Всі вимірювання вказані в сантиметрах",
      sizeGuideSizeHeader: "Розмір",
      sizeGuideChestHeader: "Обхват\nгрудей",
      sizeGuideWaistHeader: "Обхват\nталії",
      sizeGuideHipsHeader: "Обхват\nбедер",
      sizeGuideHeightHeader: "Зріст",
      toastAddedToCart: "Товар додано в кошик",
      toastGoToCheckout: "Перейти",
      descriptionTitle: "опис",
      fabricTitle: "Cклад тканини:",
      liningTitle: "Підкладка:",
      selectSizeError: "Оберіть розмір",
      selectColorError: "Оберіть колір",
      productNotLoadedError: "Товар не завантажений",
      basketUnavailableError:
        "Кошик недоступний. Спробуйте оновити сторінку.",
      noStockError:
        "На жаль, цього товару обраного розміру немає в наявності 😔",
      maxQuantityReachedError: (stock) =>
        `На жаль, ви вже додали максимум доступної кількості цього товару. В наявності: ${stock} шт.`,
      limitedQuantityAvailableError: (available, stock) =>
        `На жаль, доступно лише ${available} шт. цього товару. В наявності: ${stock} шт.`,
      viewColorAria: (label) => `Переглянути ${label}`,
      recommendationsTitle: "Доповніть свій LOOK",
      moreProductsLabel: "Більше товарів",
      comingSoonLabel: "Очікуємо поставку",
    },
    certificate: {
      title: "Подарунковий сертифікат",
      subtitle:
        "Подаруйте стиль — без зайвих турбот. Сертифікат CHARS — це свобода обрати те, що справді резонує: від базових речей до сезонних колекцій у шоурумі в Києві.",
      availabilityLabel: "Завжди в наявності",
      chooseAmountLabel: "Оберіть номінал",
      buyButton: "Купити сертифікат",
      descriptionTitle: "Про сертифікат",
      description:
        "Електронний подарунковий сертифікат CHARS — елегантний спосіб порадувати близьких або колег. Після оплати ми надішлемо сертифікат на вказаний email. Його можна використати для покупок онлайн або в шоурумі CHARS KYIV.",
      features: [
        "Дійсний 12 місяців з моменту покупки",
        "Використання онлайн та в шоурумі",
        "Можна поєднувати з акційними пропозиціями",
        "Елегантне оформлення — готовий подарунок",
        "Номінали від 2 000 до 20 000 грн",
      ],
      alsoInUah: "також у гривнях",
      alsoInEur: "також у євро",
      previewBadge: "Gift",
      previewCodeLabel: "Код сертифікату",
      amountPrefix: "На суму",
      previewTagline: "Стиль — це найкращий подарунок",
      previewValid: "Дійсний 12 місяців",
      formTitle: "Оформлення сертифіката",
      formSubtitle: (amount) =>
        `Ви обрали сертифікат на ${amount}. Заповніть дані для отримання та оплати.`,
      nameLabel: "Ім'я",
      namePlaceholder: "Ваше ім'я",
      phoneLabel: "Телефон",
      phonePlaceholder: "+380 XX XXX XX XX",
      emailLabel: "Email",
      emailPlaceholder: "email@example.com",
      submitButton: "Перейти до оплати",
      submitting: "Створюємо рахунок...",
      fillAllFields: "Будь ласка, заповніть усі поля",
      redirecting: "Перенаправляємо на сторінку оплати Monobank...",
      errorGeneric:
        "На жаль, не вдалося створити рахунок. Спробуйте ще раз або зв'яжіться з нами.",
      paymentSuccessTitle: "Оплата успішна!",
      paymentSuccessDescription:
        "Ваш подарунковий сертифікат CHARS активовано. Ми надіслали його на вказаний email.",
      paymentSuccessEmailHint: (email) =>
        `Перевірте пошту ${email} — лист може потрапити в «Спам».`,
      paymentSuccessOrderLabel: "Номер замовлення",
      continueShopping: "Продовжити покупки",
      backToHome: "На головну",
    },
    purchaseInParts: {
      title: "Покупка частинами monobank | Universal Bank",
      subtitle: "Оплата товарів CHARS частинами — без переплат і комісій для покупця.",
      providerTitle: "Надавач послуг",
      providerBody:
        "АТ «УНІВЕРСАЛ БАНК» ліцензія НБУ No92 від 20.01.1994, номер у держреєстрі банків No 226.",
      productTitle: "Характеристики продукту",
      productItems: [
        "Мінімальна сума розстрочки: 2 грн",
        "Максимальна сума розстрочки: 400 000 грн",
        "Реальна річна процентна ставка: 0,000001%",
        "Доступний строк, платежів: 3 - 25",
        "Порядок погашення: щомісячні платежі рівними частинами",
        "Перший платіж у момент оформлення покупки",
        "Інформація про істотні характеристики продукту та попередження розміщені на сайті продукту chast.monobank.ua",
      ],
      highlightTitle: "Без переплат і комісій",
      highlightBody:
        "Покупка частинами monobank — зручний спосіб оплатити замовлення CHARS щомісячними платежами без переплат і комісій для покупця.",
      legalRate:
        "Реальна річна процентна ставка — 0,000001%, макс. строк кредитування до 400 000 грн — 24 місяці. Перший внесок — аванс у розмірі щомісячного платежу.",
      legalBank:
        "АТ «УНІВЕРСАЛ БАНК», Ліцензія НБУ №92 від 20.01.1994, у держреєстрі банків No226, деталі на monobank.ua",
      moreInfo: "Більше деталей:",
    },
    admin: {
      ordersFetchError: "Не вдалося завантажити замовлення",
      ordersGenericError: "Щось пішло не так під час завантаження замовлень",
    },
  },
  de: {
    common: {
      backToHome: "Zur Startseite",
      loading: "Wird geladen...",
      noResults: "Keine Ergebnisse gefunden",
      notFoundTitle: "Seite nicht gefunden",
      notFoundDescription:
        "Die gesuchte Seite scheint verloren gegangen zu sein. Keine Sorge — bei uns gibt es noch vieles zu entdecken.",
      notFoundCatalog: "Produktkatalog",
      notFoundHint: "Wenn Sie glauben, dass dies ein Fehler ist, kontaktieren Sie uns bitte",
      searchPlaceholder: "Suche...",
      searchHint: "Geben Sie eine Suchanfrage ein, um Produkte zu finden.",
    },
    header: {
      info: "INFO",
      about: "Über uns",
      paymentAndDelivery: "Zahlung und Lieferung",
      reviews: "Bewertungen",
      contacts: "Kontakt",
      menuLabel: "Menü",
      themeToggleAriaLight: "Helles Design aktivieren",
      themeToggleAriaDark: "Dunkles Design aktivieren",
      searchOpenAria: "Suche öffnen",
      basketOpenAria: (count) =>
        `Warenkorb öffnen. Artikel im Warenkorb: ${count}`,
      basketCountAria: (count) => `${count} Artikel im Warenkorb`,
      seasonCategory: "Saison",
      collections: "Kollektionen",
      seasonSpring: "Frühling",
      seasonSummer: "Sommer",
      seasonAutumn: "Herbst",
      seasonWinter: "Winter",
      goToCategoryAria: (name) => `Zur Kategorie ${name} wechseln`,
      currencyLabel: "Währung",
      languageLabel: "Sprache",
      langSwitcherAria: "Sprache der Website ändern",
      certificates: "Gutscheine",
      catalogMenu: "Katalog",
      viewAllCategory: "Alle Artikel",
    },
    collections: {
      title: "Kollektionen",
      subtitle:
        "Wählen Sie eine Saison — und entdecken Sie Looks für Stimmung und Wetter.",
      chooseSeason: "Saison wählen",
      viewCollection: "Kollektion ansehen",
    },
    footer: {
      showroomAddressLabel: "Adresse des Showrooms:",
      showroomAddressValue: "Kyjiw, Konstjantyniwśka-Straße 21",
      workingHoursTitle: "Öffnungszeiten",
      workingHoursValue: "Mo–Fr 13:00–19:00",
      phoneTitle: "Telefon",
      navigationTitle: "Navigation",
      navigationAbout: "Über uns",
      navigationPaymentAndDelivery: "Zahlung und Lieferung",
      navigationReviews: "Bewertungen",
      navigationContacts: "Kontakt",
      privacyPolicy: "Datenschutzerklärung",
      termsOfService: "AGB / Angebot",
      purchaseInParts: "Kauf in Raten",
      devCredit: "Telebots | Webentwicklung",
      designCredit: "Sviat | Webdesign",
    },
    home: {
      limitedTitle: "Limitierte Kollektion von CHARS",
      limitedSubtitle:
        "Limitierte Kollektion – für alle, denen Einzigartigkeit wichtig ist.",
      topSaleTitle: "Bestseller | CHARS",
      topSaleSubtitle: "Lieblingslooks unserer Kunden.",
      heroCatalogButton: "Katalog",
      aboutTitle: "Über uns",
      aboutText:
        "CHARS ist eine ukrainische Herrenmodemarke, gegründet im August 2023 in Kyjiw.\nWir sind während des Krieges entstanden – als die Zukunft ungewiss war, aber Träume stark blieben.\nWir nähen das, was wir selbst tragen wollen – ohne Kompromisse.\nIn unserer eigenen Werkstatt kontrollieren wir jeden Produktionsschritt und verbinden Smart-Casual, Casual-Klassik und etwas Sport.\nWir schaffen Kleidung für unterschiedliche Männer – zurückhaltende und mutige, klassische und unkonventionelle.\nVerschieden, aber echt.",
      faqTitleLine1: "Sie fragen",
      faqTitleLine2: "oft nach",
      faqSubtitleLine1: "Wir haben die häufigsten",
      faqSubtitleLine2: "Fragen unserer Kunden gesammelt",
      faqItems: [
        {
          number: "01",
          title: "Zahlung | CHARS KYIV",
          contentIntro: "Zahlung für verfügbare Artikel und Maßanfertigungen",
          contentBody:
            "Für verfügbare Artikel aus unseren Kollektionen sind folgende Zahlungsarten möglich:\n— Anzahlung von 300 UAH (nach Bestätigung der Verfügbarkeit)\n— Vollständige Bezahlung\n— Kauf in Raten monobank (ohne Überzahlung und Gebühren für den Käufer).\n\nFür Maßanfertigungen und Artikel mit angepassten Parametern (z. B. Länge, Taille) ist eine 100%ige Vorauszahlung vor Beginn der Arbeit erforderlich.\n\nDetails zum Kauf in Raten — auf der Seite «Kauf in Raten» (im Footer der Website).\n\nAlle Zahlungsdetails klären wir persönlich mit Ihnen nach Aufgabe der Bestellung.",
        },
        {
          number: "02",
          title: "Lieferung | CHARS KYIV",
          contentIntro: "Lieferung in der Ukraine und Abholung im Showroom",
          contentBody:
            "Die Lieferung innerhalb der Ukraine erfolgt mit „Nova Poshta“ in eine Filiale, an einen Paketautomaten oder per Kurier an die angegebene Adresse.\n\nSie können Ihre Bestellung auch persönlich in unserem Showroom in Kyjiw (Konstjantyniwśka-Str. 21) während der Öffnungszeiten abholen.\n\nGenaue Lieferzeiten und -kosten stimmen wir nach Aufgabe der Bestellung mit Ihnen ab.",
        },
        {
          number: "03",
          title: "Rückgabe | CHARS KYIV",
          contentIntro: "Rückgabe und Umtausch von Artikeln",
          contentBody:
            "Die Rückgabe von Ware in einwandfreiem Zustand ist gemäß der ukrainischen Gesetzgebung möglich, sofern das Warenbild, die Etiketten und die Unversehrtheit des Artikels erhalten bleiben.\n\nMaßanfertigungen (mit angepassten Parametern oder nach individuellen Maßen) sind von der Rückgabe ausgeschlossen, außer im Falle eines Produktionsfehlers.",
        },
        {
          number: "04",
          title: "Versand der Bestellung | CHARS KYIV",
          contentIntro: "Bearbeitungs- und Versandzeiten",
          contentBody:
            "Die Bearbeitung und Zusammenstellung der Bestellung dauert in der Regel 1–3 Werktage nach Bestätigung und Zahlung.\n\nNach dem Versand senden wir Ihnen die Sendungsnummer von „Nova Poshta“ per Messenger oder SMS, damit Sie Ihr Paket verfolgen können.",
        },
      ],
      reviewsTitleLine1: "Eindrücke",
      reviewsTitleLine2: "unserer Kunden",
      reviewsSubtitle:
        "Weitere Bewertungen finden Sie in unserem Instagram-Profil",
      whyChooseUsTitle: "Warum man uns wählt",
      whyChooseUsSubtitle:
        "Chars – wenn Ästhetik keine überflüssigen Worte braucht.",
      whyChooseUsItems: [
        {
          top: "Eigene Produktion",
          bottom:
            "Wir kontrollieren jeden Schritt – vom Schnittmuster bis zum letzten Stich.",
        },
        {
          top: "Maßanfertigung",
          bottom:
            "Wir schaffen keine „Durchschnittskleidung“ – wir schaffen deine Kleidung.",
        },
        {
          top: "Outfit in 24 Stunden",
          bottom:
            "Bei uns gibt es kein „langes Warten“ – sondern Respekt für deine Zeit.",
        },
        {
          top: "Qualität, die man spürt",
          bottom:
            "Jedes Teil geht durch die Hände eines Meisters, nicht nur durch eine Maschine.",
        },
        {
          top: "Lokale ukrainische Marke",
          bottom:
            "Wir unterstützen lokale Produktion, faire Arbeit und schaffen Teile, die leise, aber klar sprechen.",
        },
      ],
      socialTitleLine1: "Wir sind näher,",
      socialTitleLine2: "als es scheint!",
      socialSubtitle:
        "Limitierte Kollektion – für alle, denen Einzigartigkeit wichtig ist.",
      socialTikTok: "WIR SIND AUF TIKTOK",
      socialInstagram: "WIR SIND AUF INSTAGRAM",
    },
    breadcrumbs: {
      homeLabel: "Startseite",
      goToAria: (label) => `Zu ${label} wechseln`,
    },
    checkout: {
      title: "Bitte alle Felder ausfüllen",
      emptyTitle: "Ihr Warenkorb ist leer",
      continueShopping: "Weiter einkaufen",
      fillAllFieldsTitle: "Bitte alle Felder ausfüllen",
      customerDataTitle: "Kundendaten",
      totalLabel: "Gesamt",
      summaryThankYouLine1: "Vielen Dank für",
      summaryThankYouLine2: "Ihre Bestellung!",
      summaryNameLabel: "Name:",
      summaryEmailLabel: "Email:",
      summaryPhoneLabel: "Telefon:",
      summaryCityLabel: "Stadt:",
      summaryPostOfficeLabel: "Filiale:",
      summaryCommentLabel: "Kommentar:",
      nameLabel: "Vor- und Nachname",
      namePlaceholder: "Ihr Vor- und Nachname",
      emailLabel: "Email",
      emailPlaceholder: "Ihre Email",
      phoneLabel: "Telefon",
      phonePlaceholder: "Ihre Telefonnummer (z. B. +491701234567)",
      deliveryMethodLabel: "Versandart *",
      deliveryMethodPlaceholder: "Versandart wählen",
      deliveryOptionNpBranch: "Nova Poshta – in die Filiale",
      deliveryOptionNpLocker: "Nova Poshta – in den Paketautomaten",
      deliveryOptionNpCourier: "Nova Poshta – per Kurier",
      deliveryOptionShowroom: "Abholung im Showroom (13:00–19:00)",
      cityLabel: "Stadt *",
      cityCourierLabel: "Stadt für Kurierzustellung *",
      cityPlaceholder: "Stadtname eingeben",
      citiesLoading: "Städte werden geladen...",
      postOfficeLabel: "Filiale *",
      postOfficeLockerLabel: "Paketautomat *",
      postOfficePlaceholder: "Filialname eingeben",
      postOfficeLockerPlaceholder: "Paketautomat-Name eingeben",
      postOfficesLoading: "Filialen werden geladen...",
      showroomInfo:
        "Abholung im Showroom von 13:00 bis 19:00, Kyjiw, Konstjantyniwśka-Str. 21",
      addressLabel: "Lieferadresse (Straße, Haus, Wohnung) *",
      addressPlaceholder:
        "Z.B.: Sitschowyh Strilziw Str. 10, Whg. 25",
      commentLabel: "Kommentar",
      commentPlaceholder: "Ihr Kommentar",
      paymentMethodLabel: "Wählen Sie eine Zahlungsart",
      paymentMethodPlaceholder: "Zahlungsart wählen",
      paymentOptionFull: "Plata by mono",
      paymentOptionPrepay: "Anzahlung 300 ₴",
      paymentOptionPaypalFull: "PayPal",
      paymentOptionInstallments: "Kauf in Raten monobank",
      paymentOptionInstallmentsHint: "Ohne Überzahlung und Gebühren",
      paymentTrustBadgesAria: "Verfügbare Kartenzahlungen",
      submitSending: "Wird gesendet...",
      submitLabel: "Senden",
      basketEmptyInline: "Ihr Warenkorb ist leer",
      itemColorLabel: "Farbe",
      itemQtyLabel: "Menge",
      increaseQtyTitle: "Menge erhöhen",
      maxStockTitle: (stock) =>
        `Maximale verfügbare Anzahl: ${stock} Stk.`,
      countryLabel: "Land *",
      countryOtherLabel: "Land angeben *",
      countryOtherPlaceholder: "Z.B.: Deutschland, USA, Kanada",
      deliveryOptionInternational: "Internationaler Versand (weltweit)",
      postalCodeLabel: "Postleitzahl *",
      postalCodePlaceholder: "PLZ / Postleitzahl",
      internationalInfo:
        "Kosten und Lieferzeiten des internationalen Versands werden gemäß den Tarifen des Versanddienstleisters in Ihrem Land berechnet. Nach Aufgabe der Bestellung kontaktieren wir Sie, um den Versanddienst und die genauen Kosten zu bestätigen.",
      errorRequiredFields:
        "Bitte füllen Sie alle erforderlichen Felder aus, damit wir Ihre Bestellung schnell bearbeiten können ✨",
      errorFullName:
        "Bitte geben Sie Ihren vollständigen Vor- und Nachnamen ein – so können wir Ihre Bestellung schneller bearbeiten 😊",
      errorCartEmpty:
        "Ihr Warenkorb ist leer. Fügen Sie Produkte hinzu, die Ihnen gefallen, und kommen Sie zurück! 🛒",
      errorGeneric:
        "Es tut uns leid, etwas ist schiefgelaufen. Bitte versuchen Sie es erneut oder kontaktieren Sie uns – wir helfen Ihnen gerne! 💪",
      errorNoInvoice:
        "Leider können wir derzeit keinen Zahlungslink erstellen. Bitte versuchen Sie es später erneut oder kontaktieren Sie unseren Support.",
      errorNetwork:
        "Offenbar gibt es Probleme mit der Internetverbindung. Bitte prüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
      errorCitiesGeneric:
        "Leider können wir die Liste der Städte derzeit nicht laden. Bitte versuchen Sie es später erneut.",
      errorCitiesNetwork:
        "Es ist ein Fehler beim Laden der Städte aufgetreten. Bitte prüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
      errorWarehousesGeneric:
        "Leider können wir die Liste der Filialen derzeit nicht laden. Bitte versuchen Sie es später erneut.",
      paymentSuccess:
        "✅ Zahlung erfolgreich! Ihre Bestellung wurde angenommen. Wir senden Ihnen eine SMS mit der Sendungsnummer, sobald die Bestellung verpackt ist.",
      orderCreatedRedirecting:
        "Die Bestellung wurde erfolgreich erstellt! Wir leiten Sie nun zur Bezahlung weiter...",
      orderCreatedInstallments:
        "Antrag erstellt! Öffnen Sie die Monobank-App und bestätigen Sie die Ratenzahlung.",
      paymentStatusTitle: "Zahlungsstatus wird geprüft...",
      paymentStatusDescription: "Bitte warten",
      paymentStatusInstallmentsDescription:
        "Bestätigen Sie die Zahlung in der Monobank-App. Diese Seite aktualisiert sich automatisch nach der Bestätigung.",
      giftCertificateLabel: "Geschenkgutschein",
      giftCertificatePlaceholder: "CHARS-XXXX-XXXX",
      giftCertificateApply: "Anwenden",
      giftCertificateApplied: (code) => `Gutschein ${code} angewendet`,
      giftCertificateAppliedStatus: "Gutschein angewendet",
      giftCertificateAppliedAmount: (amount, currency) =>
        `Rabatt −${amount} ${currency}`,
      giftCertificateDiscountLabel: "Gutscheinrabatt",
      giftCertificateRemove: "Code ändern",
      subtotalLabel: "Zwischensumme",
    },
    basket: {
      title: "Warenkorb",
      empty: "Ihr Warenkorb ist leer",
      sizeLabel: "Größe",
      checkoutButton: "Zur Kasse",
      boughtWithThisTitle: "Dazu wird oft genommen",
    },
    catalog: {
      allProductsLabel: "Alle Produkte",
      filtersLabel: "Filter",
      showMoreLabel: "Mehr anzeigen",
      sidebarTitle: "Filtern / Sortieren",
      sortAccordionTitle: "Sortieren nach",
      sortAscLabel: "Preis aufsteigend",
      sortDescLabel: "Preis absteigend",
      sizeAccordionTitle: "Größe",
      colorAccordionTitle: "Farbe",
      priceAccordionTitle: "Preis",
      minPriceLabel: "Mindestpreis",
      maxPriceLabel: "Höchstpreis",
      minPricePlaceholder: "ab",
      maxPricePlaceholder: "bis",
      colorNames: {
        Бежевий: "Beige",
        Блакитний: "Hellblau",
        Білий: "Weiß",
        Жовтий: "Gelb",
        Зелений: "Grün",
        Кораловий: "Koralle",
        Коричневий: "Braun",
        Кремовий: "Creme",
        Малиновий: "Himbeerrot",
        Помаранчевий: "Orange",
        Рожевий: "Rosa",
        "Світло-сірий": "Hellgrau",
        Синій: "Blau",
        Сірий: "Grau",
        "Темно-синій": "Dunkelblau",
        "Темно-сірий": "Dunkelgrau",
        Фіолетовий: "Violett",
        Хаки: "Khaki",
        Червоний: "Rot",
        Чорний: "Schwarz",
        Бордо: "Bordeaux",
        "Еко-шкіра": "Öko-Leder",
        "Темно-синя": "Dunkelblau",
      },
    },
    product: {
      inStockLabel: "Auf Lager",
      chooseSizeLabel: "Größe wählen",
      sizeGuideLabel: "Größentabelle",
      outOfStockLabel: "Nicht vorrätig",
      colorLabel: "Farbe",
      addToCartLabel: "In den Warenkorb",
      contactManagerLabel: "Manager anschreiben",
      imagePlaceholder: "Produktfoto",
      sizeGuideTitle: "GRÖSSENTABELLE",
      sizeGuideSubtitle: "Alle Maße sind in Zentimetern angegeben",
      sizeGuideSizeHeader: "Größe",
      sizeGuideChestHeader: "Brustumfang",
      sizeGuideWaistHeader: "Taillenumfang",
      sizeGuideHipsHeader: "Hüftumfang",
      sizeGuideHeightHeader: "Körpergröße",
      toastAddedToCart: "Artikel wurde in den Warenkorb gelegt",
      toastGoToCheckout: "Weiter",
      descriptionTitle: "Beschreibung",
      fabricTitle: "Stoffzusammensetzung:",
      liningTitle: "Futter:",
      selectSizeError: "Bitte Größe wählen",
      selectColorError: "Bitte Farbe wählen",
      productNotLoadedError: "Produkt wurde nicht geladen",
      basketUnavailableError:
        "Der Warenkorb ist nicht verfügbar. Bitte Seite neu laden.",
      noStockError:
        "Leider ist dieser Artikel in der gewählten Größe nicht vorrätig 😔",
      maxQuantityReachedError: (stock) =>
        `Sie haben bereits die maximal verfügbare Menge dieses Artikels im Warenkorb. Verfügbar: ${stock} Stk.`,
      limitedQuantityAvailableError: (available, stock) =>
        `Leider sind nur noch ${available} Stk. dieses Artikels verfügbar. Insgesamt auf Lager: ${stock} Stk.`,
      viewColorAria: (label) => `${label} ansehen`,
      recommendationsTitle: "Ergänzen Sie Ihren LOOK",
      moreProductsLabel: "Mehr Produkte",
      comingSoonLabel: "Bald verfügbar",
    },
    certificate: {
      title: "Geschenkgutschein",
      subtitle:
        "Schenken Sie Stil — ganz unkompliziert. Der CHARS-Gutschein gibt die Freiheit, genau das zu wählen, was passt: von Basics bis zu Saisonkollektionen im Showroom in Kiew.",
      availabilityLabel: "Jederzeit verfügbar",
      chooseAmountLabel: "Betrag wählen",
      buyButton: "Gutschein kaufen",
      descriptionTitle: "Über den Gutschein",
      description:
        "Der digitale CHARS-Geschenkgutschein ist eine elegante Art, Freunde, Familie oder Kollegen zu beschenken. Nach der Zahlung senden wir den Gutschein an die angegebene E-Mail. Er kann online oder im CHARS KYIV Showroom eingelöst werden.",
      features: [
        "12 Monate ab Kaufdatum gültig",
        "Online und im Showroom einlösbar",
        "Kombinierbar mit Aktionen",
        "Elegantes Design — sofort verschenkbar",
        "Nennwerte von 2.000 bis 20.000 UAH",
      ],
      alsoInUah: "auch in UAH",
      alsoInEur: "auch in EUR",
      previewBadge: "Gift",
      previewCodeLabel: "Gutscheincode",
      amountPrefix: "Für den Betrag",
      previewTagline: "Stil ist das schönste Geschenk",
      previewValid: "12 Monate gültig",
      formTitle: "Gutschein bestellen",
      formSubtitle: (amount) =>
        `Sie haben einen Gutschein über ${amount} gewählt. Bitte füllen Sie Ihre Daten aus.`,
      nameLabel: "Name",
      namePlaceholder: "Ihr Name",
      phoneLabel: "Telefon",
      phonePlaceholder: "+49 XXX XXXXXXX",
      emailLabel: "E-Mail",
      emailPlaceholder: "email@beispiel.de",
      submitButton: "Zur Zahlung",
      submitting: "Rechnung wird erstellt...",
      fillAllFields: "Bitte füllen Sie alle Felder aus",
      redirecting: "Weiterleitung zur Monobank-Zahlungsseite...",
      errorGeneric:
        "Leider konnte keine Rechnung erstellt werden. Bitte versuchen Sie es erneut.",
      paymentSuccessTitle: "Zahlung erfolgreich!",
      paymentSuccessDescription:
        "Ihr CHARS-Geschenkgutschein ist aktiv. Wir haben ihn an die angegebene E-Mail gesendet.",
      paymentSuccessEmailHint: (email) =>
        `Bitte prüfen Sie ${email} — die E-Mail kann im Spam-Ordner landen.`,
      paymentSuccessOrderLabel: "Bestellnummer",
      continueShopping: "Weiter einkaufen",
      backToHome: "Zur Startseite",
    },
    purchaseInParts: {
      title: "Kauf in Raten monobank | Universal Bank",
      subtitle:
        "CHARS-Bestellungen in Raten bezahlen — ohne Überzahlung und Gebühren für den Käufer.",
      providerTitle: "Dienstleister",
      providerBody:
        "JSC «UNIVERSAL BANK», NBU-Lizenz Nr. 92 vom 20.01.1994, Eintrag im staatlichen Bankenregister Nr. 226.",
      productTitle: "Produkteigenschaften",
      productItems: [
        "Mindestbetrag der Ratenzahlung: 2 UAH",
        "Höchstbetrag der Ratenzahlung: 400 000 UAH",
        "Effektiver Jahreszins: 0,000001%",
        "Verfügbare Laufzeit, Raten: 3 - 25",
        "Rückzahlung: monatliche Raten in gleichen Teilen",
        "Erste Rate zum Zeitpunkt des Kaufs",
        "Wesentliche Produktmerkmale und Hinweise: chast.monobank.ua",
      ],
      highlightTitle: "Ohne Überzahlung und Gebühren",
      highlightBody:
        "Kauf in Raten monobank — eine bequeme Möglichkeit, CHARS-Bestellungen in monatlichen Raten ohne Überzahlung und Gebühren für den Käufer zu bezahlen.",
      legalRate:
        "Effektiver Jahreszins — 0,000001%, max. Kreditlaufzeit bis 400 000 UAH — 24 Monate. Erste Zahlung — Anzahlung in Höhe der Monatsrate.",
      legalBank:
        "JSC «UNIVERSAL BANK», NBU-Lizenz Nr. 92 vom 20.01.1994, staatliches Bankenregister Nr. 226, Details auf monobank.ua",
      moreInfo: "Weitere Informationen:",
    },
    admin: {
      ordersFetchError: "Bestellungen konnten nicht geladen werden",
      ordersGenericError: "Beim Laden der Bestellungen ist ein Fehler aufgetreten",
    },
  },
  en: {
    common: {
      backToHome: "Back to home",
      loading: "Loading...",
      noResults: "No results found",
      notFoundTitle: "Page not found",
      notFoundDescription:
        "The page you are looking for seems to have wandered off. There is plenty more to explore.",
      notFoundCatalog: "Product catalog",
      notFoundHint: "If you think this is a mistake, please get in touch",
      searchPlaceholder: "Search...",
      searchHint: "Type a query to search products.",
    },
    header: {
      info: "INFO",
      about: "About us",
      paymentAndDelivery: "Payment and delivery",
      reviews: "Reviews",
      contacts: "Contacts",
      menuLabel: "Menu",
      themeToggleAriaLight: "Enable light theme",
      themeToggleAriaDark: "Enable dark theme",
      searchOpenAria: "Open search",
      basketOpenAria: (count) => `Open cart. Items in cart: ${count}`,
      basketCountAria: (count) => `${count} items in cart`,
      seasonCategory: "Season",
      collections: "Collections",
      seasonSpring: "Spring",
      seasonSummer: "Summer",
      seasonAutumn: "Autumn",
      seasonWinter: "Winter",
      goToCategoryAria: (name) => `Go to category ${name}`,
      currencyLabel: "Currency",
      languageLabel: "Language",
      langSwitcherAria: "Change website language",
      certificates: "Certificates",
      catalogMenu: "Catalog",
      viewAllCategory: "View all",
    },
    collections: {
      title: "Collections",
      subtitle:
        "Choose a season — and discover pieces curated for mood and weather.",
      chooseSeason: "Choose a season",
      viewCollection: "View collection",
    },
    footer: {
      showroomAddressLabel: "Showroom address:",
      showroomAddressValue: "Kyiv, 21 Kostiantynivska St.",
      workingHoursTitle: "Working hours",
      workingHoursValue: "Mon–Fri 13:00–19:00",
      phoneTitle: "Phone",
      navigationTitle: "Navigation",
      navigationAbout: "About us",
      navigationPaymentAndDelivery: "Payment and delivery",
      navigationReviews: "Reviews",
      navigationContacts: "Contacts",
      privacyPolicy: "Privacy policy",
      termsOfService: "Public offer",
      purchaseInParts: "Purchase in parts",
      devCredit: "Telebots | Website development",
      designCredit: "Sviat | Website design",
    },
    home: {
      limitedTitle: "Limited collection by CHARS",
      limitedSubtitle:
        "Limited collection — for those who care about uniqueness.",
      topSaleTitle: "Top sellers | CHARS",
      topSaleSubtitle: "Favorite looks of our clients.",
      heroCatalogButton: "Catalog",
      aboutTitle: "About us",
      aboutText:
        "CHARS is a Ukrainian menswear brand founded in August 2023 in Kyiv.\nWe appeared during the war, when the future was uncertain but dreams remained strong.\nWe sew what we ourselves want to wear – with no compromises.\nIn our own workshop we control every production stage, combining smart-casual, casual classic and a bit of sport.\nWe create clothing for different men – reserved and bold, classic and unconventional.\nDifferent, but genuine.",
      faqTitleLine1: "You often",
      faqTitleLine2: "ask us",
      faqSubtitleLine1: "We have collected the most common",
      faqSubtitleLine2: "questions from our visitors",
      faqItems: [
        {
          number: "01",
          title: "Payment | CHARS KYIV",
          contentIntro: "Payment for in‑stock items and custom orders",
          contentBody:
            "For ready‑to‑wear items in stock we offer the following payment options:\n— Prepayment of 300 UAH (after confirming availability)\n— Full payment\n— Purchase in parts with monobank (no overpayments or fees for the buyer).\n\nFor custom pieces and items with adjusted measurements (length, waist, etc.) we require 100% prepayment before we start.\n\nPurchase in parts details — on the “Purchase in parts” page (in the site footer).\n\nAll payment details are confirmed with you personally after you place the order.",
        },
        {
          number: "02",
          title: "Delivery | CHARS KYIV",
          contentIntro: "Delivery across Ukraine and showroom pickup",
          contentBody:
            "Delivery across Ukraine is carried out via Nova Poshta – to a branch, locker or by courier to your address.\n\nYou can also pick up your order in person at the CHARS showroom in Kyiv (21 Kostiantynivska St.) during working hours.\n\nExact delivery time and cost are confirmed after you place the order.",
        },
        {
          number: "03",
          title: "Returns | CHARS KYIV",
          contentIntro: "Returns and exchanges",
          contentBody:
            "Returns of items in proper condition are possible in accordance with Ukrainian law, provided the product appearance, tags and integrity are preserved, and there are no signs of wear.\n\nCustom‑made items (with adjusted measurements or made to your individual sizes) cannot be returned, except in case of manufacturing defects.",
        },
        {
          number: "04",
          title: "Order dispatch | CHARS KYIV",
          contentIntro: "Order processing and dispatch times",
          contentBody:
            "Order processing and packing usually take 1–3 working days after confirmation and payment.\n\nOnce your parcel is shipped, we send you the Nova Poshta tracking number via messenger or SMS so you can follow the delivery.",
        },
      ],
      reviewsTitleLine1: "Impressions",
      reviewsTitleLine2: "of our clients",
      reviewsSubtitle: "See more reviews on our Instagram profile",
      whyChooseUsTitle: "Why choose us",
      whyChooseUsSubtitle:
        "Chars – when aesthetics doesn’t need extra words.",
      whyChooseUsItems: [
        {
          top: "Own production",
          bottom:
            "We control every step – from the pattern to the last stitch.",
        },
        {
          top: "Tailoring to individual measurements",
          bottom:
            "We don’t create “average” clothes – we create yours.",
        },
        {
          top: "Full look in 24 hours",
          bottom:
            "We don’t have “long waiting times” – we value your time instead.",
        },
        {
          top: "Quality you can feel",
          bottom:
            "Every item goes through the hands of a master, not just a machine.",
        },
        {
          top: "Local Ukrainian brand",
          bottom:
            "We support local production, fair work and create pieces that speak quietly, but clearly.",
        },
      ],
      socialTitleLine1: "We are closer,",
      socialTitleLine2: "than it seems!",
      socialSubtitle:
        "Limited collection – for those who care about uniqueness.",
      socialTikTok: "WE ARE ON TIKTOK",
      socialInstagram: "WE ARE ON INSTAGRAM",
    },
    breadcrumbs: {
      homeLabel: "Home",
      goToAria: (label) => `Go to ${label}`,
    },
    checkout: {
      title: "Fill in all fields",
      emptyTitle: "Your cart is empty",
      continueShopping: "Continue shopping",
      fillAllFieldsTitle: "Fill in all fields",
      customerDataTitle: "Customer details",
      totalLabel: "Total",
      summaryThankYouLine1: "Thank you for",
      summaryThankYouLine2: "your order!",
      summaryNameLabel: "Name:",
      summaryEmailLabel: "Email:",
      summaryPhoneLabel: "Phone:",
      summaryCityLabel: "City:",
      summaryPostOfficeLabel: "Branch:",
      summaryCommentLabel: "Comment:",
      nameLabel: "First and last name",
      namePlaceholder: "Your first and last name",
      emailLabel: "Email",
      emailPlaceholder: "Your email",
      phoneLabel: "Phone",
      phonePlaceholder: "Your phone (e.g. +447700900123)",
      deliveryMethodLabel: "Delivery method *",
      deliveryMethodPlaceholder: "Choose delivery method",
      deliveryOptionNpBranch: "Nova Poshta — to branch",
      deliveryOptionNpLocker: "Nova Poshta — to locker",
      deliveryOptionNpCourier: "Nova Poshta — by courier",
      deliveryOptionShowroom: "Pickup from showroom (13:00–19:00)",
      cityLabel: "City *",
      cityCourierLabel: "City for courier delivery *",
      cityPlaceholder: "Enter city name",
      citiesLoading: "Loading cities...",
      postOfficeLabel: "Branch *",
      postOfficeLockerLabel: "Locker *",
      postOfficePlaceholder: "Enter branch name",
      postOfficeLockerPlaceholder: "Enter locker name",
      postOfficesLoading: "Loading branches...",
      showroomInfo:
        "Pickup from showroom from 13:00 to 19:00, Kyiv, 21 Kostiantynivska St.",
      addressLabel: "Delivery address (street, building, apartment) *",
      addressPlaceholder: "E.g.: Sichovykh Striltsiv St. 10, apt. 25",
      commentLabel: "Comment",
      commentPlaceholder: "Your comment",
      paymentMethodLabel: "Choose a convenient payment method",
      paymentMethodPlaceholder: "Choose payment method",
      paymentOptionFull: "Plata by mono",
      paymentOptionPrepay: "Prepayment 300 ₴",
      paymentOptionPaypalFull: "PayPal",
      paymentOptionInstallments: "Purchase in parts monobank",
      paymentOptionInstallmentsHint: "No overpayments or fees",
      paymentTrustBadgesAria: "Available card payment methods",
      submitSending: "Sending...",
      submitLabel: "Submit",
      basketEmptyInline: "Your cart is empty",
      itemColorLabel: "Color",
      itemQtyLabel: "Quantity",
      increaseQtyTitle: "Increase quantity",
      maxStockTitle: (stock) =>
        `Maximum quantity in stock: ${stock} pcs.`,
      countryLabel: "Country *",
      countryOtherLabel: "Specify country *",
      countryOtherPlaceholder: "E.g.: Germany, USA, Canada",
      deliveryOptionInternational: "International shipping (worldwide)",
      postalCodeLabel: "Postal code *",
      postalCodePlaceholder: "ZIP / Postal code",
      internationalInfo:
        "International shipping cost and delivery time are calculated according to the carrier's tariffs in your country. After placing the order, we will contact you to confirm the carrier and the exact cost.",
      errorRequiredFields:
        "Please fill in all required fields so we can process your order quickly ✨",
      errorFullName:
        "Please enter your full first and last name — this helps us process your order faster 😊",
      errorCartEmpty:
        "Your cart is empty. Add products you like and come back! 🛒",
      errorGeneric:
        "Sorry, something went wrong. Please try again or contact us — we will be happy to help! 💪",
      errorNoInvoice:
        "Unfortunately, we cannot create a payment link right now. Please try again in a few minutes or contact our support.",
      errorNetwork:
        "It looks like there are problems with your internet connection. Please check it and try again.",
      errorCitiesGeneric:
        "Unfortunately, we cannot load the list of cities at the moment. Please try again in a few minutes.",
      errorCitiesNetwork:
        "There was a problem loading the list of cities. Please check your connection and try again.",
      errorWarehousesGeneric:
        "Unfortunately, we cannot load the list of branches at the moment. Please try again in a few minutes.",
      paymentSuccess:
        "✅ Payment successful! Your order has been received. We will send you an SMS with the tracking number once the order is packed.",
      orderCreatedRedirecting:
        "Order successfully created! Redirecting you to payment...",
      orderCreatedInstallments:
        "Request created! Open the Monobank app and confirm purchase in parts.",
      paymentStatusTitle: "Checking payment status...",
      paymentStatusDescription: "Please wait",
      paymentStatusInstallmentsDescription:
        "Confirm the payment in the Monobank app. This page will update automatically after confirmation.",
      giftCertificateLabel: "Gift certificate",
      giftCertificatePlaceholder: "CHARS-XXXX-XXXX",
      giftCertificateApply: "Apply",
      giftCertificateApplied: (code) => `Certificate ${code} applied`,
      giftCertificateAppliedStatus: "Certificate applied",
      giftCertificateAppliedAmount: (amount, currency) =>
        `Discount −${amount} ${currency}`,
      giftCertificateDiscountLabel: "Certificate discount",
      giftCertificateRemove: "Change code",
      subtotalLabel: "Subtotal",
    },
    basket: {
      title: "Cart",
      empty: "Your cart is empty",
      sizeLabel: "Size",
      checkoutButton: "Checkout",
      boughtWithThisTitle: "Frequently bought with this",
    },
    catalog: {
      allProductsLabel: "All products",
      filtersLabel: "Filters",
      showMoreLabel: "Show more",
      sidebarTitle: "Filter / Sort",
      sortAccordionTitle: "Sort by",
      sortAscLabel: "Price: low to high",
      sortDescLabel: "Price: high to low",
      sizeAccordionTitle: "Size",
      colorAccordionTitle: "Color",
      priceAccordionTitle: "Price",
      minPriceLabel: "Minimum price",
      maxPriceLabel: "Maximum price",
      minPricePlaceholder: "from",
      maxPricePlaceholder: "to",
      colorNames: {
        Бежевий: "Beige",
        Блакитний: "Light blue",
        Білий: "White",
        Жовтий: "Yellow",
        Зелений: "Green",
        Кораловий: "Coral",
        Коричневий: "Brown",
        Кремовий: "Cream",
        Малиновий: "Raspberry",
        Помаранчевий: "Orange",
        Рожевий: "Pink",
        "Світло-сірий": "Light grey",
        Синій: "Blue",
        Сірий: "Grey",
        "Темно-синій": "Dark blue",
        "Темно-сірий": "Dark grey",
        Фіолетовий: "Purple",
        Хаки: "Khaki",
        Червоний: "Red",
        Чорний: "Black",
        Бордо: "Bordeaux",
        "Еко-шкіра": "Eco leather",
        "Темно-синя": "Dark blue",
      },
    },
    product: {
      inStockLabel: "In stock",
      chooseSizeLabel: "Choose size",
      sizeGuideLabel: "Size guide",
      outOfStockLabel: "Out of stock",
      colorLabel: "Color",
      addToCartLabel: "Add to cart",
      contactManagerLabel: "Message manager",
      imagePlaceholder: "Product photo",
      sizeGuideTitle: "SIZE GUIDE",
      sizeGuideSubtitle: "All measurements are given in centimeters",
      sizeGuideSizeHeader: "Size",
      sizeGuideChestHeader: "Chest\ncircumference",
      sizeGuideWaistHeader: "Waist\ncircumference",
      sizeGuideHipsHeader: "Hips\ncircumference",
      sizeGuideHeightHeader: "Height",
      toastAddedToCart: "Item added to cart",
      toastGoToCheckout: "Go",
      descriptionTitle: "Description",
      fabricTitle: "Fabric composition:",
      liningTitle: "Lining:",
      selectSizeError: "Please choose a size",
      selectColorError: "Please choose a color",
      productNotLoadedError: "Product is not loaded",
      basketUnavailableError:
        "Cart is unavailable. Please try reloading the page.",
      noStockError:
        "Unfortunately this item in the selected size is out of stock 😔",
      maxQuantityReachedError: (stock) =>
        `You have already added the maximum available quantity of this item. In stock: ${stock} pcs.`,
      limitedQuantityAvailableError: (available, stock) =>
        `Only ${available} pcs. of this item are available. In stock: ${stock} pcs.`,
      viewColorAria: (label) => `View ${label}`,
      recommendationsTitle: "Complete your LOOK",
      moreProductsLabel: "More products",
      comingSoonLabel: "Coming soon",
    },
    certificate: {
      title: "Gift Certificate",
      subtitle:
        "Give the gift of style — effortlessly. A CHARS certificate lets them choose what truly resonates: from wardrobe essentials to seasonal collections at our Kyiv showroom.",
      availabilityLabel: "Always available",
      chooseAmountLabel: "Choose amount",
      buyButton: "Buy certificate",
      descriptionTitle: "About the certificate",
      description:
        "The CHARS digital gift certificate is an elegant way to treat someone special. After payment, we will send the certificate to the email provided. It can be used for online purchases or at the CHARS KYIV showroom.",
      features: [
        "Valid for 12 months from purchase",
        "Redeemable online and in-store",
        "Can be combined with promotions",
        "Elegant design — ready to gift",
        "Denominations from 2,000 to 20,000 UAH",
      ],
      alsoInUah: "also in UAH",
      alsoInEur: "also in EUR",
      previewBadge: "Gift",
      previewCodeLabel: "Certificate code",
      amountPrefix: "For the amount",
      previewTagline: "Style is the finest gift",
      previewValid: "Valid for 12 months",
      formTitle: "Purchase certificate",
      formSubtitle: (amount) =>
        `You selected a ${amount} certificate. Please fill in your details to continue.`,
      nameLabel: "Name",
      namePlaceholder: "Your name",
      phoneLabel: "Phone",
      phonePlaceholder: "+1 XXX XXX XXXX",
      emailLabel: "Email",
      emailPlaceholder: "email@example.com",
      submitButton: "Proceed to payment",
      submitting: "Creating invoice...",
      fillAllFields: "Please fill in all fields",
      redirecting: "Redirecting to Monobank payment page...",
      errorGeneric:
        "Sorry, we could not create the invoice. Please try again or contact us.",
      paymentSuccessTitle: "Payment successful!",
      paymentSuccessDescription:
        "Your CHARS gift certificate is active. We have sent it to the email you provided.",
      paymentSuccessEmailHint: (email) =>
        `Please check ${email} — the email may land in your spam folder.`,
      paymentSuccessOrderLabel: "Order number",
      continueShopping: "Continue shopping",
      backToHome: "Back to home",
    },
    purchaseInParts: {
      title: "Purchase in parts monobank | Universal Bank",
      subtitle:
        "Pay for CHARS orders in installments — with no overpayments or fees for the buyer.",
      providerTitle: "Service provider",
      providerBody:
        "JSC «UNIVERSAL BANK», NBU license No. 92 dated 20.01.1994, state bank register No. 226.",
      productTitle: "Product terms",
      productItems: [
        "Minimum installment amount: 2 UAH",
        "Maximum installment amount: 400,000 UAH",
        "Real annual interest rate: 0.000001%",
        "Available term, payments: 3 - 25",
        "Repayment: equal monthly payments",
        "First payment at the moment of purchase",
        "Essential product characteristics and warnings: chast.monobank.ua",
      ],
      highlightTitle: "No overpayments or fees",
      highlightBody:
        "Purchase in parts with monobank — a convenient way to pay for CHARS orders in monthly installments with no overpayments or fees for the buyer.",
      legalRate:
        "Real annual interest rate — 0.000001%, max. credit term for amounts up to 400,000 UAH — 24 months. First payment — advance equal to the monthly installment.",
      legalBank:
        "JSC «UNIVERSAL BANK», NBU license No. 92 dated 20.01.1994, state bank register No. 226, details at monobank.ua",
      moreInfo: "More details:",
    },
    admin: {
      ordersFetchError: "Failed to fetch orders",
      ordersGenericError: "Something went wrong while loading orders",
    },
  },
};

export function getMessages(locale: Locale): Messages {
  return messages[locale] ?? messages.uk;
}

