// ─── Страны и города ─────────────────────────────────────────────────────────

export interface Country {
  code: string;
  name: string;
  flag: string;
  continent: string;
  // координаты центра (для карты, 0-100%)
  mapX: number;
  mapY: number;
}

export interface City {
  id: string;
  name: string;
  countryCode: string;
  population: number; // млн
  // позиция на карте (0-100%)
  x: number;
  y: number;
}

export const COUNTRIES: Country[] = [
  { code: "RU", name: "Россия",        flag: "🇷🇺", continent: "Europe/Asia", mapX: 65, mapY: 25 },
  { code: "US", name: "США",           flag: "🇺🇸", continent: "North America", mapX: 18, mapY: 38 },
  { code: "DE", name: "Германия",      flag: "🇩🇪", continent: "Europe", mapX: 47, mapY: 28 },
  { code: "FR", name: "Франция",       flag: "🇫🇷", continent: "Europe", mapX: 45, mapY: 32 },
  { code: "GB", name: "Великобритания",flag: "🇬🇧", continent: "Europe", mapX: 43, mapY: 26 },
  { code: "CN", name: "Китай",         flag: "🇨🇳", continent: "Asia", mapX: 78, mapY: 38 },
  { code: "BR", name: "Бразилия",      flag: "🇧🇷", continent: "South America", mapX: 32, mapY: 62 },
  { code: "IN", name: "Индия",         flag: "🇮🇳", continent: "Asia", mapX: 70, mapY: 45 },
  { code: "AU", name: "Австралия",     flag: "🇦🇺", continent: "Oceania", mapX: 82, mapY: 70 },
  { code: "JP", name: "Япония",        flag: "🇯🇵", continent: "Asia", mapX: 87, mapY: 35 },
  { code: "CA", name: "Канада",        flag: "🇨🇦", continent: "North America", mapX: 20, mapY: 25 },
  { code: "MX", name: "Мексика",       flag: "🇲🇽", continent: "North America", mapX: 20, mapY: 48 },
  { code: "AR", name: "Аргентина",     flag: "🇦🇷", continent: "South America", mapX: 30, mapY: 75 },
  { code: "ZA", name: "ЮАР",           flag: "🇿🇦", continent: "Africa", mapX: 52, mapY: 72 },
  { code: "EG", name: "Египет",        flag: "🇪🇬", continent: "Africa", mapX: 54, mapY: 43 },
  { code: "NG", name: "Нигерия",       flag: "🇳🇬", continent: "Africa", mapX: 49, mapY: 52 },
  { code: "TR", name: "Турция",        flag: "🇹🇷", continent: "Asia", mapX: 56, mapY: 37 },
  { code: "KR", name: "Южная Корея",   flag: "🇰🇷", continent: "Asia", mapX: 85, mapY: 37 },
  { code: "ID", name: "Индонезия",     flag: "🇮🇩", continent: "Asia", mapX: 82, mapY: 58 },
  { code: "SA", name: "Саудовская Аравия", flag: "🇸🇦", continent: "Asia", mapX: 60, mapY: 45 },
];

// 10 городов для каждой страны (для автобусной фазы)
export const CITIES_BY_COUNTRY: Record<string, City[]> = {
  RU: [
    { id: "ru-mow", name: "Москва",          countryCode: "RU", population: 12.5, x: 40, y: 30 },
    { id: "ru-led", name: "Санкт-Петербург", countryCode: "RU", population: 5.4,  x: 30, y: 18 },
    { id: "ru-nsk", name: "Новосибирск",     countryCode: "RU", population: 1.6,  x: 68, y: 32 },
    { id: "ru-ekb", name: "Екатеринбург",    countryCode: "RU", population: 1.5,  x: 58, y: 30 },
    { id: "ru-kzn", name: "Казань",          countryCode: "RU", population: 1.3,  x: 50, y: 33 },
    { id: "ru-nnd", name: "Нижний Новгород", countryCode: "RU", population: 1.2,  x: 46, y: 33 },
    { id: "ru-che", name: "Челябинск",       countryCode: "RU", population: 1.1,  x: 60, y: 33 },
    { id: "ru-sma", name: "Самара",          countryCode: "RU", population: 1.1,  x: 52, y: 36 },
    { id: "ru-ufa", name: "Уфа",             countryCode: "RU", population: 1.1,  x: 56, y: 34 },
    { id: "ru-rnd", name: "Ростов-на-Дону",  countryCode: "RU", population: 1.1,  x: 42, y: 40 },
  ],
  US: [
    { id: "us-nyc", name: "Нью-Йорк",        countryCode: "US", population: 8.3,  x: 73, y: 30 },
    { id: "us-lax", name: "Лос-Анджелес",    countryCode: "US", population: 4.0,  x: 20, y: 40 },
    { id: "us-chi", name: "Чикаго",           countryCode: "US", population: 2.7,  x: 62, y: 27 },
    { id: "us-hou", name: "Хьюстон",          countryCode: "US", population: 2.3,  x: 52, y: 50 },
    { id: "us-phx", name: "Феникс",           countryCode: "US", population: 1.6,  x: 30, y: 44 },
    { id: "us-phi", name: "Филадельфия",      countryCode: "US", population: 1.6,  x: 72, y: 31 },
    { id: "us-san", name: "Сан-Антонио",      countryCode: "US", population: 1.4,  x: 50, y: 53 },
    { id: "us-sdi", name: "Сан-Диего",        countryCode: "US", population: 1.4,  x: 22, y: 43 },
    { id: "us-dal", name: "Даллас",           countryCode: "US", population: 1.3,  x: 52, y: 47 },
    { id: "us-sfo", name: "Сан-Франциско",    countryCode: "US", population: 0.9,  x: 15, y: 35 },
  ],
  DE: [
    { id: "de-ber", name: "Берлин",           countryCode: "DE", population: 3.7,  x: 52, y: 22 },
    { id: "de-ham", name: "Гамбург",          countryCode: "DE", population: 1.9,  x: 45, y: 15 },
    { id: "de-mun", name: "Мюнхен",           countryCode: "DE", population: 1.5,  x: 50, y: 48 },
    { id: "de-col", name: "Кёльн",            countryCode: "DE", population: 1.1,  x: 38, y: 30 },
    { id: "de-fra", name: "Франкфурт",        countryCode: "DE", population: 0.8,  x: 42, y: 35 },
    { id: "de-stu", name: "Штутгарт",         countryCode: "DE", population: 0.6,  x: 43, y: 45 },
    { id: "de-dus", name: "Дюссельдорф",      countryCode: "DE", population: 0.6,  x: 37, y: 28 },
    { id: "de-dor", name: "Дортмунд",         countryCode: "DE", population: 0.6,  x: 40, y: 27 },
    { id: "de-ess", name: "Эссен",            countryCode: "DE", population: 0.6,  x: 38, y: 27 },
    { id: "de-lei", name: "Лейпциг",          countryCode: "DE", population: 0.6,  x: 53, y: 30 },
  ],
  FR: [
    { id: "fr-par", name: "Париж",            countryCode: "FR", population: 2.2,  x: 45, y: 28 },
    { id: "fr-mar", name: "Марсель",          countryCode: "FR", population: 0.9,  x: 50, y: 62 },
    { id: "fr-lyo", name: "Лион",             countryCode: "FR", population: 0.5,  x: 51, y: 52 },
    { id: "fr-tou", name: "Тулуза",           countryCode: "FR", population: 0.5,  x: 44, y: 65 },
    { id: "fr-nic", name: "Ницца",            countryCode: "FR", population: 0.3,  x: 57, y: 66 },
    { id: "fr-nan", name: "Нант",             countryCode: "FR", population: 0.3,  x: 35, y: 42 },
    { id: "fr-str", name: "Страсбург",        countryCode: "FR", population: 0.3,  x: 60, y: 30 },
    { id: "fr-mtp", name: "Монпелье",         countryCode: "FR", population: 0.3,  x: 48, y: 68 },
    { id: "fr-bor", name: "Бордо",            countryCode: "FR", population: 0.2,  x: 38, y: 57 },
    { id: "fr-lil", name: "Лилль",            countryCode: "FR", population: 0.2,  x: 47, y: 18 },
  ],
  GB: [
    { id: "gb-lon", name: "Лондон",           countryCode: "GB", population: 9.0,  x: 50, y: 52 },
    { id: "gb-bir", name: "Бирмингем",        countryCode: "GB", population: 1.1,  x: 47, y: 40 },
    { id: "gb-lee", name: "Лидс",             countryCode: "GB", population: 0.8,  x: 50, y: 30 },
    { id: "gb-gla", name: "Глазго",           countryCode: "GB", population: 0.6,  x: 40, y: 15 },
    { id: "gb-she", name: "Шеффилд",          countryCode: "GB", population: 0.6,  x: 51, y: 33 },
    { id: "gb-man", name: "Манчестер",        countryCode: "GB", population: 0.6,  x: 46, y: 33 },
    { id: "gb-bri", name: "Бристоль",         countryCode: "GB", population: 0.5,  x: 44, y: 55 },
    { id: "gb-liv", name: "Ливерпуль",        countryCode: "GB", population: 0.5,  x: 43, y: 35 },
    { id: "gb-edi", name: "Эдинбург",         countryCode: "GB", population: 0.5,  x: 43, y: 18 },
    { id: "gb-lei", name: "Лестер",           countryCode: "GB", population: 0.3,  x: 50, y: 45 },
  ],
  CN: [
    { id: "cn-sha", name: "Шанхай",           countryCode: "CN", population: 24.2, x: 72, y: 42 },
    { id: "cn-bei", name: "Пекин",            countryCode: "CN", population: 21.5, x: 67, y: 30 },
    { id: "cn-gua", name: "Гуанчжоу",        countryCode: "CN", population: 15.3, x: 67, y: 58 },
    { id: "cn-she", name: "Шэньчжэнь",       countryCode: "CN", population: 12.9, x: 68, y: 60 },
    { id: "cn-tia", name: "Тяньцзинь",        countryCode: "CN", population: 11.1, x: 69, y: 32 },
    { id: "cn-wuh", name: "Ухань",            countryCode: "CN", population: 8.9,  x: 67, y: 46 },
    { id: "cn-don", name: "Дунгуань",         countryCode: "CN", population: 8.0,  x: 68, y: 59 },
    { id: "cn-che", name: "Чэнду",            countryCode: "CN", population: 8.0,  x: 60, y: 45 },
    { id: "cn-nij", name: "Нанкин",           countryCode: "CN", population: 6.6,  x: 71, y: 41 },
    { id: "cn-xi",  name: "Сиань",            countryCode: "CN", population: 6.5,  x: 62, y: 38 },
  ],
  BR: [
    { id: "br-sao", name: "Сан-Паулу",        countryCode: "BR", population: 12.3, x: 62, y: 62 },
    { id: "br-rio", name: "Рио-де-Жанейро",   countryCode: "BR", population: 6.7,  x: 64, y: 57 },
    { id: "br-bsa", name: "Бразилиа",         countryCode: "BR", population: 3.0,  x: 57, y: 47 },
    { id: "br-sal", name: "Салвадор",         countryCode: "BR", population: 2.9,  x: 65, y: 44 },
    { id: "br-for", name: "Форталеза",        countryCode: "BR", population: 2.6,  x: 66, y: 36 },
    { id: "br-bel", name: "Белем",            countryCode: "BR", population: 1.5,  x: 57, y: 32 },
    { id: "br-man", name: "Манаус",           countryCode: "BR", population: 2.1,  x: 43, y: 34 },
    { id: "br-cur", name: "Куритиба",         countryCode: "BR", population: 1.9,  x: 60, y: 65 },
    { id: "br-rec", name: "Ресифи",           countryCode: "BR", population: 1.6,  x: 68, y: 40 },
    { id: "br-por", name: "Порту-Алегри",     countryCode: "BR", population: 1.5,  x: 57, y: 72 },
  ],
  IN: [
    { id: "in-mum", name: "Мумбаи",           countryCode: "IN", population: 12.5, x: 32, y: 52 },
    { id: "in-del", name: "Дели",             countryCode: "IN", population: 11.0, x: 38, y: 32 },
    { id: "in-ban", name: "Бангалор",         countryCode: "IN", population: 8.4,  x: 38, y: 65 },
    { id: "in-hyd", name: "Хайдарабад",       countryCode: "IN", population: 6.8,  x: 40, y: 57 },
    { id: "in-ahm", name: "Ахмадабад",        countryCode: "IN", population: 5.5,  x: 30, y: 40 },
    { id: "in-che", name: "Ченнаи",           countryCode: "IN", population: 4.6,  x: 42, y: 68 },
    { id: "in-kol", name: "Калькутта",        countryCode: "IN", population: 4.5,  x: 55, y: 45 },
    { id: "in-sur", name: "Сурат",            countryCode: "IN", population: 4.5,  x: 30, y: 45 },
    { id: "in-pun", name: "Пуна",             countryCode: "IN", population: 3.1,  x: 33, y: 53 },
    { id: "in-jai", name: "Джайпур",          countryCode: "IN", population: 3.0,  x: 35, y: 35 },
  ],
  AU: [
    { id: "au-syd", name: "Сидней",           countryCode: "AU", population: 5.3,  x: 80, y: 65 },
    { id: "au-mel", name: "Мельбурн",         countryCode: "AU", population: 5.0,  x: 73, y: 72 },
    { id: "au-bri", name: "Брисбен",          countryCode: "AU", population: 2.5,  x: 82, y: 55 },
    { id: "au-per", name: "Перт",             countryCode: "AU", population: 2.1,  x: 25, y: 62 },
    { id: "au-ade", name: "Аделаида",         countryCode: "AU", population: 1.3,  x: 58, y: 68 },
    { id: "au-gco", name: "Голд-Кост",        countryCode: "AU", population: 0.7,  x: 83, y: 57 },
    { id: "au-cbr", name: "Канберра",         countryCode: "AU", population: 0.4,  x: 77, y: 68 },
    { id: "au-nca", name: "Ньюкасл",          countryCode: "AU", population: 0.4,  x: 81, y: 63 },
    { id: "au-sun", name: "Саншайн-Кост",     countryCode: "AU", population: 0.3,  x: 82, y: 54 },
    { id: "au-dar", name: "Дарвин",           countryCode: "AU", population: 0.1,  x: 47, y: 22 },
  ],
  JP: [
    { id: "jp-tok", name: "Токио",            countryCode: "JP", population: 9.7,  x: 70, y: 38 },
    { id: "jp-yok", name: "Иокогама",         countryCode: "JP", population: 3.7,  x: 72, y: 40 },
    { id: "jp-osa", name: "Осака",            countryCode: "JP", population: 2.7,  x: 60, y: 45 },
    { id: "jp-nag", name: "Нагоя",            countryCode: "JP", population: 2.3,  x: 63, y: 43 },
    { id: "jp-sap", name: "Саппоро",          countryCode: "JP", population: 1.9,  x: 75, y: 18 },
    { id: "jp-fuk", name: "Фукуока",          countryCode: "JP", population: 1.6,  x: 50, y: 50 },
    { id: "jp-kob", name: "Кобэ",             countryCode: "JP", population: 1.5,  x: 59, y: 46 },
    { id: "jp-kyo", name: "Киото",            countryCode: "JP", population: 1.5,  x: 60, y: 44 },
    { id: "jp-kaw", name: "Кавасаки",         countryCode: "JP", population: 1.5,  x: 71, y: 39 },
    { id: "jp-sei", name: "Сайтама",          countryCode: "JP", population: 1.3,  x: 70, y: 36 },
  ],
  CA: [
    { id: "ca-tor", name: "Торонто",          countryCode: "CA", population: 2.9,  x: 70, y: 42 },
    { id: "ca-mon", name: "Монреаль",         countryCode: "CA", population: 2.0,  x: 78, y: 38 },
    { id: "ca-van", name: "Ванкувер",         countryCode: "CA", population: 0.7,  x: 18, y: 35 },
    { id: "ca-cal", name: "Калгари",          countryCode: "CA", population: 1.3,  x: 30, y: 38 },
    { id: "ca-edm", name: "Эдмонтон",         countryCode: "CA", population: 1.0,  x: 28, y: 33 },
    { id: "ca-ott", name: "Оттава",           countryCode: "CA", population: 1.0,  x: 74, y: 40 },
    { id: "ca-mis", name: "Миссисога",        countryCode: "CA", population: 0.7,  x: 69, y: 43 },
    { id: "ca-win", name: "Виннипег",         countryCode: "CA", population: 0.8,  x: 47, y: 40 },
    { id: "ca-que", name: "Квебек",           countryCode: "CA", population: 0.5,  x: 80, y: 35 },
    { id: "ca-ham", name: "Гамильтон",        countryCode: "CA", population: 0.5,  x: 70, y: 43 },
  ],
  MX: [
    { id: "mx-mex", name: "Мехико",           countryCode: "MX", population: 9.2,  x: 42, y: 57 },
    { id: "mx-eca", name: "Экатепек",         countryCode: "MX", population: 1.8,  x: 43, y: 55 },
    { id: "mx-gua", name: "Гвадалахара",      countryCode: "MX", population: 1.5,  x: 33, y: 52 },
    { id: "mx-pue", name: "Пуэбла",           countryCode: "MX", population: 1.5,  x: 45, y: 59 },
    { id: "mx-jua", name: "Сьюдад-Хуарес",   countryCode: "MX", population: 1.4,  x: 28, y: 33 },
    { id: "mx-tij", name: "Тихуана",          countryCode: "MX", population: 1.3,  x: 18, y: 38 },
    { id: "mx-leo", name: "Леон",             countryCode: "MX", population: 1.2,  x: 36, y: 53 },
    { id: "mx-mon", name: "Монтеррей",        countryCode: "MX", population: 1.1,  x: 38, y: 44 },
    { id: "mx-zap", name: "Сапопан",          countryCode: "MX", population: 1.1,  x: 33, y: 52 },
    { id: "mx-nez", name: "Незауалькойотль",  countryCode: "MX", population: 1.1,  x: 43, y: 57 },
  ],
  AR: [
    { id: "ar-bue", name: "Буэнос-Айрес",    countryCode: "AR", population: 3.1,  x: 45, y: 72 },
    { id: "ar-cor", name: "Кордова",          countryCode: "AR", population: 1.4,  x: 40, y: 60 },
    { id: "ar-ros", name: "Росарио",          countryCode: "AR", population: 1.2,  x: 43, y: 65 },
    { id: "ar-men", name: "Мендоса",          countryCode: "AR", population: 1.1,  x: 35, y: 65 },
    { id: "ar-la",  name: "Ла-Плата",         countryCode: "AR", population: 0.7,  x: 47, y: 72 },
    { id: "ar-san", name: "Сан-Мигель",       countryCode: "AR", population: 0.7,  x: 43, y: 62 },
    { id: "ar-saz", name: "Сан-Хуан",         countryCode: "AR", population: 0.5,  x: 35, y: 62 },
    { id: "ar-sal", name: "Сальта",           countryCode: "AR", population: 0.6,  x: 37, y: 50 },
    { id: "ar-mar", name: "Мар-дель-Плата",   countryCode: "AR", population: 0.6,  x: 50, y: 76 },
    { id: "ar-sur", name: "Сан-Луис",         countryCode: "AR", population: 0.2,  x: 38, y: 65 },
  ],
  ZA: [
    { id: "za-joh", name: "Йоханнесбург",    countryCode: "ZA", population: 5.6,  x: 57, y: 62 },
    { id: "za-cap", name: "Кейптаун",        countryCode: "ZA", population: 4.6,  x: 42, y: 82 },
    { id: "za-dur", name: "Дурбан",           countryCode: "ZA", population: 3.4,  x: 65, y: 70 },
    { id: "za-pre", name: "Претория",         countryCode: "ZA", population: 2.9,  x: 58, y: 60 },
    { id: "za-por", name: "Порт-Элизабет",   countryCode: "ZA", population: 1.3,  x: 55, y: 78 },
    { id: "za-blo", name: "Блумфонтейн",     countryCode: "ZA", population: 0.7,  x: 52, y: 70 },
    { id: "za-ben", name: "Бенони",           countryCode: "ZA", population: 0.5,  x: 59, y: 62 },
    { id: "za-eas", name: "Ист-Лондон",       countryCode: "ZA", population: 0.5,  x: 58, y: 76 },
    { id: "za-pie", name: "Питермарицбург",   countryCode: "ZA", population: 0.5,  x: 64, y: 72 },
    { id: "za-pol", name: "Полокване",        countryCode: "ZA", population: 0.5,  x: 58, y: 55 },
  ],
  EG: [
    { id: "eg-cai", name: "Каир",             countryCode: "EG", population: 10.1, x: 55, y: 40 },
    { id: "eg-ale", name: "Александрия",      countryCode: "EG", population: 5.2,  x: 52, y: 33 },
    { id: "eg-giz", name: "Гиза",             countryCode: "EG", population: 3.6,  x: 54, y: 41 },
    { id: "eg-shu", name: "Шубра-эль-Хейма",  countryCode: "EG", population: 1.1,  x: 55, y: 39 },
    { id: "eg-por", name: "Порт-Саид",        countryCode: "EG", population: 0.8,  x: 59, y: 35 },
    { id: "eg-sue", name: "Суэц",             countryCode: "EG", population: 0.7,  x: 60, y: 40 },
    { id: "eg-man", name: "Эль-Мансура",      countryCode: "EG", population: 0.5,  x: 57, y: 35 },
    { id: "eg-lux", name: "Луксор",           countryCode: "EG", population: 0.5,  x: 57, y: 55 },
    { id: "eg-asy", name: "Асьют",            countryCode: "EG", population: 0.4,  x: 56, y: 50 },
    { id: "eg-asm", name: "Асуан",            countryCode: "EG", population: 0.3,  x: 57, y: 62 },
  ],
  NG: [
    { id: "ng-lag", name: "Лагос",            countryCode: "NG", population: 9.0,  x: 43, y: 58 },
    { id: "ng-kan", name: "Кано",             countryCode: "NG", population: 3.6,  x: 49, y: 42 },
    { id: "ng-ibh", name: "Ибадан",           countryCode: "NG", population: 3.6,  x: 43, y: 60 },
    { id: "ng-abj", name: "Абуджа",           countryCode: "NG", population: 2.9,  x: 48, y: 55 },
    { id: "ng-por", name: "Порт-Харкорт",    countryCode: "NG", population: 1.9,  x: 47, y: 63 },
    { id: "ng-ben", name: "Бенин-Сити",       countryCode: "NG", population: 1.5,  x: 46, y: 60 },
    { id: "ng-mai", name: "Майдугури",        countryCode: "NG", population: 1.2,  x: 54, y: 42 },
    { id: "ng-zar", name: "Зария",            countryCode: "NG", population: 1.0,  x: 48, y: 44 },
    { id: "ng-ilo", name: "Илорин",           countryCode: "NG", population: 0.8,  x: 44, y: 55 },
    { id: "ng-jos", name: "Джос",             countryCode: "NG", population: 0.7,  x: 49, y: 50 },
  ],
  TR: [
    { id: "tr-ist", name: "Стамбул",          countryCode: "TR", population: 15.5, x: 32, y: 30 },
    { id: "tr-ank", name: "Анкара",           countryCode: "TR", population: 5.7,  x: 45, y: 35 },
    { id: "tr-izm", name: "Измир",            countryCode: "TR", population: 4.4,  x: 28, y: 42 },
    { id: "tr-bur", name: "Бурса",            countryCode: "TR", population: 3.1,  x: 34, y: 35 },
    { id: "tr-ant", name: "Анталья",          countryCode: "TR", population: 2.6,  x: 42, y: 52 },
    { id: "tr-ada", name: "Адана",            countryCode: "TR", population: 2.2,  x: 52, y: 50 },
    { id: "tr-koc", name: "Коджаэли",         countryCode: "TR", population: 2.0,  x: 36, y: 30 },
    { id: "tr-mer", name: "Мерсин",           countryCode: "TR", population: 1.8,  x: 50, y: 52 },
    { id: "tr-diy", name: "Диярбакыр",        countryCode: "TR", population: 1.7,  x: 65, y: 45 },
    { id: "tr-hal", name: "Газиантеп",        countryCode: "TR", population: 1.6,  x: 58, y: 50 },
  ],
  KR: [
    { id: "kr-seo", name: "Сеул",             countryCode: "KR", population: 9.9,  x: 42, y: 28 },
    { id: "kr-bus", name: "Пусан",            countryCode: "KR", population: 3.4,  x: 55, y: 52 },
    { id: "kr-inc", name: "Инчхон",           countryCode: "KR", population: 2.9,  x: 38, y: 32 },
    { id: "kr-dag", name: "Тэгу",             countryCode: "KR", population: 2.5,  x: 52, y: 45 },
    { id: "kr-daj", name: "Тэджон",           countryCode: "KR", population: 1.5,  x: 45, y: 42 },
    { id: "kr-gwj", name: "Кванджу",          countryCode: "KR", population: 1.5,  x: 40, y: 55 },
    { id: "kr-suw", name: "Сувон",            countryCode: "KR", population: 1.2,  x: 42, y: 34 },
    { id: "kr-uls", name: "Ульсан",           countryCode: "KR", population: 1.1,  x: 57, y: 48 },
    { id: "kr-goy", name: "Коян",             countryCode: "KR", population: 1.0,  x: 40, y: 28 },
    { id: "kr-cha", name: "Чхонан",           countryCode: "KR", population: 0.6,  x: 44, y: 38 },
  ],
  ID: [
    { id: "id-jak", name: "Джакарта",         countryCode: "ID", population: 10.6, x: 42, y: 53 },
    { id: "id-sur", name: "Сурабая",          countryCode: "ID", population: 2.9,  x: 52, y: 55 },
    { id: "id-ban", name: "Бандунг",          countryCode: "ID", population: 2.6,  x: 42, y: 54 },
    { id: "id-bek", name: "Бекаси",           countryCode: "ID", population: 2.5,  x: 43, y: 53 },
    { id: "id-med", name: "Medan",            countryCode: "ID", population: 2.2,  x: 28, y: 42 },
    { id: "id-sep", name: "Семаранг",         countryCode: "ID", population: 1.8,  x: 48, y: 54 },
    { id: "id-tan", name: "Тангеранг",        countryCode: "ID", population: 1.8,  x: 41, y: 53 },
    { id: "id-mak", name: "Макасар",          countryCode: "ID", population: 1.4,  x: 62, y: 56 },
    { id: "id-dep", name: "Депок",            countryCode: "ID", population: 1.3,  x: 43, y: 54 },
    { id: "id-pal", name: "Палембанг",        countryCode: "ID", population: 1.7,  x: 35, y: 51 },
  ],
  SA: [
    { id: "sa-riy", name: "Эр-Рияд",          countryCode: "SA", population: 6.5,  x: 55, y: 53 },
    { id: "sa-jed", name: "Джедда",           countryCode: "SA", population: 4.1,  x: 44, y: 57 },
    { id: "sa-mec", name: "Мекка",            countryCode: "SA", population: 2.0,  x: 43, y: 60 },
    { id: "sa-med", name: "Медина",           countryCode: "SA", population: 1.2,  x: 44, y: 50 },
    { id: "sa-dam", name: "Даммам",           countryCode: "SA", population: 1.1,  x: 60, y: 50 },
    { id: "sa-hof", name: "Хуфуф",            countryCode: "SA", population: 0.6,  x: 60, y: 55 },
    { id: "sa-tai", name: "Таиф",             countryCode: "SA", population: 0.6,  x: 46, y: 63 },
    { id: "sa-tab", name: "Табук",            countryCode: "SA", population: 0.6,  x: 40, y: 44 },
    { id: "sa-bur", name: "Бурайда",          countryCode: "SA", population: 0.4,  x: 50, y: 47 },
    { id: "sa-kha", name: "Хамис-Мушайт",    countryCode: "SA", population: 0.4,  x: 48, y: 70 },
  ],
};

// ─── Транспорт ───────────────────────────────────────────────────────────────

export interface VehicleModel {
  id: string;
  name: string;
  emoji: string;
  seats: number;
  ticketPrice: number; // базовая цена билета
  cost: number;        // цена в магазине
  speed: number;       // скорость (влияет на время рейса)
  type: "bus" | "train" | "plane";
  description: string;
}

export const BUS_MODELS: VehicleModel[] = [
  { id: "bus1", name: "Старый ПАЗик",    emoji: "🚌", seats: 20, ticketPrice: 15,  cost: 0,    speed: 1.0, type: "bus",   description: "Верный старый друг. Скрипит, но едет!" },
  { id: "bus2", name: "МАЗ 203",         emoji: "🚍", seats: 35, ticketPrice: 20,  cost: 300,  speed: 1.2, type: "bus",   description: "Вместительный городской красавец" },
  { id: "bus3", name: "Yutong ZK6126",   emoji: "🚎", seats: 55, ticketPrice: 28,  cost: 800,  speed: 1.5, type: "bus",   description: "Китайское качество по хорошей цене" },
  { id: "bus4", name: "MAN Lion's Coach",emoji: "🏎️", seats: 70, ticketPrice: 38,  cost: 2000, speed: 1.8, type: "bus",   description: "Немецкая надёжность и комфорт" },
  { id: "bus5", name: "Neoplan Cityliner",emoji:"✨",  seats: 90, ticketPrice: 50,  cost: 4000, speed: 2.2, type: "bus",   description: "Люкс-класс. Пассажиры обожают!" },
];

export const TRAIN_MODELS: VehicleModel[] = [
  { id: "tr1",  name: "Тепловоз ТГМ",   emoji: "🚂", seats: 80,  ticketPrice: 40,  cost: 5000,  speed: 1.0, type: "train", description: "Старая рабочая лошадка" },
  { id: "tr2",  name: "Электричка ЭД4",  emoji: "🚃", seats: 150, ticketPrice: 60,  cost: 10000, speed: 1.4, type: "train", description: "Знакомая всем пригородная электричка" },
  { id: "tr3",  name: "Ласточка",        emoji: "🚄", seats: 200, ticketPrice: 90,  cost: 20000, speed: 2.0, type: "train", description: "Скоростная и популярная" },
  { id: "tr4",  name: "Сапсан",          emoji: "🚅", seats: 300, ticketPrice: 130, cost: 40000, speed: 2.8, type: "train", description: "Высокоскоростной красавец" },
  { id: "tr5",  name: "Maglev 600",      emoji: "⚡", seats: 400, ticketPrice: 180, cost: 80000, speed: 4.0, type: "train", description: "Магнитная левитация. Будущее уже здесь!" },
];

export const PLANE_MODELS: VehicleModel[] = [
  { id: "pl1",  name: "Ан-24",           emoji: "✈️", seats: 50,  ticketPrice: 200, cost: 30000,  speed: 1.0, type: "plane", description: "Ветеран советской авиации" },
  { id: "pl2",  name: "Boeing 737",      emoji: "🛫", seats: 150, ticketPrice: 350, cost: 70000,  speed: 1.5, type: "plane", description: "Самый популярный самолёт в мире" },
  { id: "pl3",  name: "Airbus A320",     emoji: "🛬", seats: 180, ticketPrice: 420, cost: 120000, speed: 1.8, type: "plane", description: "Европейская надёжность" },
  { id: "pl4",  name: "Boeing 777",      emoji: "🛩️", seats: 350, ticketPrice: 600, cost: 250000, speed: 2.2, type: "plane", description: "Дальнемагистральный гигант" },
  { id: "pl5",  name: "Airbus A380",     emoji: "🚀", seats: 550, ticketPrice: 900, cost: 500000, speed: 2.5, type: "plane", description: "Двухпалубный авиагигант мечты!" },
];

// ─── Константы ───────────────────────────────────────────────────────────────

export const UNLOCK_RAIL_COST = 10000;
export const UNLOCK_AIR_COST  = 50000;

// Расстояние между городами (упрощённо — евклидово по координатам)
export function cityDistance(a: City, b: City): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Цена открытия маршрута зависит от расстояния
export function routeOpenCost(dist: number, type: "bus" | "train" | "plane"): number {
  const base = { bus: 10, train: 80, plane: 500 };
  return Math.round(dist * base[type]);
}

// Время рейса — всегда 5 секунд
export function tripDurationMs(_dist: number, _vehicleSpeed: number): number {
  return 5000;
}

// Заработок с рейса
export function tripEarnings(seats: number, ticketPrice: number, dist: number): number {
  const fillRate = 0.6 + Math.random() * 0.35; // 60–95% заполняемость
  return Math.round(seats * ticketPrice * fillRate * (1 + dist * 0.01));
}