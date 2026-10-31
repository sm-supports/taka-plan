/**
 * Bundled country list for the country picker on "/": the 193 UN members plus Palestine, the
 * Holy See, Kosovo (XK) and Taiwan. Stand-in until the research workflow publishes
 * public/data/countries/index.json (lib/country/index-data.ts prefers that file when it exists).
 *
 * Row: code (ISO 3166-1 alpha-2), English name, name in the main local language and script,
 * World Bank region, currency (ISO 4217), languages (ISO 639-1, most used first, space separated).
 * `locales` is derived the same way as the engine's `localesForLanguages` (test asserts it), but
 * without importing the engine so "/" stays small. Types only from the engine.
 */
import type { CountryIndexEntry, Region } from "@taka/engine";
import { locales as UI_LOCALES, type Locale } from "@/lib/i18n/config";

type Row = readonly [code: string, nameEn: string, nameNative: string, region: Region, currency: string, languages: string];

const SA: Region = "south_asia";
const EAP: Region = "east_asia_pacific";
const ECA: Region = "europe_central_asia";
const LAC: Region = "latin_america_caribbean";
const MENA: Region = "middle_east_north_africa";
const NA: Region = "north_america";
const SSA: Region = "sub_saharan_africa";

const ROWS: readonly Row[] = [
  // South Asia
  ["AF", "Afghanistan", "افغانستان", SA, "AFN", "ps fa"],
  ["BD", "Bangladesh", "বাংলাদেশ", SA, "BDT", "bn en"],
  ["BT", "Bhutan", "འབྲུག་ཡུལ་", SA, "BTN", "dz ne en"],
  ["IN", "India", "भारत", SA, "INR", "hi en bn te mr ta ur gu kn ml"],
  ["LK", "Sri Lanka", "ශ්‍රී ලංකාව", SA, "LKR", "si ta en"],
  ["MV", "Maldives", "ދިވެހިރާއްޖެ", SA, "MVR", "dv en"],
  ["NP", "Nepal", "नेपाल", SA, "NPR", "ne en hi"],
  ["PK", "Pakistan", "پاکستان", SA, "PKR", "ur en pa ps sd"],

  // East Asia and Pacific
  ["AU", "Australia", "Australia", EAP, "AUD", "en"],
  ["BN", "Brunei", "Brunei", EAP, "BND", "ms en zh"],
  ["CN", "China", "中国", EAP, "CNY", "zh"],
  ["FJ", "Fiji", "Fiji", EAP, "FJD", "en fj hi"],
  ["FM", "Micronesia", "Micronesia", EAP, "USD", "en"],
  ["ID", "Indonesia", "Indonesia", EAP, "IDR", "id jv su"],
  ["JP", "Japan", "日本", EAP, "JPY", "ja"],
  ["KH", "Cambodia", "កម្ពុជា", EAP, "KHR", "km en"],
  ["KI", "Kiribati", "Kiribati", EAP, "AUD", "en"],
  ["KP", "North Korea", "조선", EAP, "KPW", "ko"],
  ["KR", "South Korea", "대한민국", EAP, "KRW", "ko"],
  ["LA", "Laos", "ລາວ", EAP, "LAK", "lo"],
  ["MH", "Marshall Islands", "Aelōn̄ in M̧ajeļ", EAP, "USD", "mh en"],
  ["MM", "Myanmar", "မြန်မာ", EAP, "MMK", "my en"],
  ["MN", "Mongolia", "Монгол Улс", EAP, "MNT", "mn ru"],
  ["MY", "Malaysia", "Malaysia", EAP, "MYR", "ms en zh ta"],
  ["NR", "Nauru", "Naoero", EAP, "AUD", "na en"],
  ["NZ", "New Zealand", "New Zealand", EAP, "NZD", "en mi"],
  ["PG", "Papua New Guinea", "Papua Niugini", EAP, "PGK", "en ho"],
  ["PH", "Philippines", "Pilipinas", EAP, "PHP", "tl en"],
  ["PW", "Palau", "Belau", EAP, "USD", "en"],
  ["SB", "Solomon Islands", "Solomon Islands", EAP, "SBD", "en"],
  ["SG", "Singapore", "Singapore", EAP, "SGD", "en zh ms ta"],
  ["TH", "Thailand", "ประเทศไทย", EAP, "THB", "th"],
  ["TL", "Timor-Leste", "Timor-Leste", EAP, "USD", "pt id en"],
  ["TO", "Tonga", "Tonga", EAP, "TOP", "to en"],
  ["TV", "Tuvalu", "Tuvalu", EAP, "AUD", "en"],
  ["TW", "Taiwan", "臺灣", EAP, "TWD", "zh"],
  ["VN", "Vietnam", "Việt Nam", EAP, "VND", "vi"],
  ["VU", "Vanuatu", "Vanuatu", EAP, "VUV", "bi en fr"],
  ["WS", "Samoa", "Sāmoa", EAP, "WST", "sm en"],

  // Europe and Central Asia
  ["AD", "Andorra", "Andorra", ECA, "EUR", "ca es fr"],
  ["AL", "Albania", "Shqipëria", ECA, "ALL", "sq"],
  ["AM", "Armenia", "Հայաստան", ECA, "AMD", "hy ru"],
  ["AT", "Austria", "Österreich", ECA, "EUR", "de"],
  ["AZ", "Azerbaijan", "Azərbaycan", ECA, "AZN", "az ru"],
  ["BA", "Bosnia and Herzegovina", "Bosna i Hercegovina", ECA, "BAM", "bs hr sr"],
  ["BE", "Belgium", "België", ECA, "EUR", "nl fr de"],
  ["BG", "Bulgaria", "България", ECA, "EUR", "bg"],
  ["BY", "Belarus", "Беларусь", ECA, "BYN", "ru be"],
  ["CH", "Switzerland", "Schweiz", ECA, "CHF", "de fr it rm"],
  ["CY", "Cyprus", "Κύπρος", ECA, "EUR", "el tr en"],
  ["CZ", "Czechia", "Česko", ECA, "CZK", "cs"],
  ["DE", "Germany", "Deutschland", ECA, "EUR", "de"],
  ["DK", "Denmark", "Danmark", ECA, "DKK", "da"],
  ["EE", "Estonia", "Eesti", ECA, "EUR", "et ru"],
  ["ES", "Spain", "España", ECA, "EUR", "es ca gl eu"],
  ["FI", "Finland", "Suomi", ECA, "EUR", "fi sv"],
  ["FR", "France", "France", ECA, "EUR", "fr"],
  ["GB", "United Kingdom", "United Kingdom", ECA, "GBP", "en"],
  ["GE", "Georgia", "საქართველო", ECA, "GEL", "ka ru"],
  ["GR", "Greece", "Ελλάδα", ECA, "EUR", "el"],
  ["HR", "Croatia", "Hrvatska", ECA, "EUR", "hr"],
  ["HU", "Hungary", "Magyarország", ECA, "HUF", "hu"],
  ["IE", "Ireland", "Ireland", ECA, "EUR", "en ga"],
  ["IS", "Iceland", "Ísland", ECA, "ISK", "is"],
  ["IT", "Italy", "Italia", ECA, "EUR", "it"],
  ["KG", "Kyrgyzstan", "Кыргызстан", ECA, "KGS", "ky ru"],
  ["KZ", "Kazakhstan", "Қазақстан", ECA, "KZT", "kk ru"],
  ["LI", "Liechtenstein", "Liechtenstein", ECA, "CHF", "de"],
  ["LT", "Lithuania", "Lietuva", ECA, "EUR", "lt ru"],
  ["LU", "Luxembourg", "Lëtzebuerg", ECA, "EUR", "lb fr de"],
  ["LV", "Latvia", "Latvija", ECA, "EUR", "lv ru"],
  ["MC", "Monaco", "Monaco", ECA, "EUR", "fr"],
  ["MD", "Moldova", "Moldova", ECA, "MDL", "ro ru"],
  ["ME", "Montenegro", "Crna Gora", ECA, "EUR", "sr bs sq hr"],
  ["MK", "North Macedonia", "Северна Македонија", ECA, "MKD", "mk sq"],
  ["NL", "Netherlands", "Nederland", ECA, "EUR", "nl"],
  ["NO", "Norway", "Norge", ECA, "NOK", "no"],
  ["PL", "Poland", "Polska", ECA, "PLN", "pl"],
  ["PT", "Portugal", "Portugal", ECA, "EUR", "pt"],
  ["RO", "Romania", "România", ECA, "RON", "ro hu"],
  ["RS", "Serbia", "Србија", ECA, "RSD", "sr hu"],
  ["RU", "Russia", "Россия", ECA, "RUB", "ru"],
  ["SE", "Sweden", "Sverige", ECA, "SEK", "sv"],
  ["SI", "Slovenia", "Slovenija", ECA, "EUR", "sl"],
  ["SK", "Slovakia", "Slovensko", ECA, "EUR", "sk hu"],
  ["SM", "San Marino", "San Marino", ECA, "EUR", "it"],
  ["TJ", "Tajikistan", "Тоҷикистон", ECA, "TJS", "tg ru uz"],
  ["TM", "Turkmenistan", "Türkmenistan", ECA, "TMT", "tk ru"],
  ["TR", "Türkiye", "Türkiye", ECA, "TRY", "tr ku"],
  ["UA", "Ukraine", "Україна", ECA, "UAH", "uk ru"],
  ["UZ", "Uzbekistan", "Oʻzbekiston", ECA, "UZS", "uz ru"],
  ["VA", "Holy See", "Santa Sede", ECA, "EUR", "it la"],
  ["XK", "Kosovo", "Kosova", ECA, "EUR", "sq sr"],

  // Latin America and the Caribbean
  ["AG", "Antigua and Barbuda", "Antigua and Barbuda", LAC, "XCD", "en"],
  ["AR", "Argentina", "Argentina", LAC, "ARS", "es"],
  ["BB", "Barbados", "Barbados", LAC, "BBD", "en"],
  ["BO", "Bolivia", "Bolivia", LAC, "BOB", "es qu ay"],
  ["BR", "Brazil", "Brasil", LAC, "BRL", "pt"],
  ["BS", "Bahamas", "Bahamas", LAC, "BSD", "en"],
  ["BZ", "Belize", "Belize", LAC, "BZD", "en es"],
  ["CL", "Chile", "Chile", LAC, "CLP", "es"],
  ["CO", "Colombia", "Colombia", LAC, "COP", "es"],
  ["CR", "Costa Rica", "Costa Rica", LAC, "CRC", "es"],
  ["CU", "Cuba", "Cuba", LAC, "CUP", "es"],
  ["DM", "Dominica", "Dominica", LAC, "XCD", "en"],
  ["DO", "Dominican Republic", "República Dominicana", LAC, "DOP", "es"],
  ["EC", "Ecuador", "Ecuador", LAC, "USD", "es qu"],
  ["GD", "Grenada", "Grenada", LAC, "XCD", "en"],
  ["GT", "Guatemala", "Guatemala", LAC, "GTQ", "es"],
  ["GY", "Guyana", "Guyana", LAC, "GYD", "en"],
  ["HN", "Honduras", "Honduras", LAC, "HNL", "es"],
  ["HT", "Haiti", "Ayiti", LAC, "HTG", "ht fr"],
  ["JM", "Jamaica", "Jamaica", LAC, "JMD", "en"],
  ["KN", "Saint Kitts and Nevis", "Saint Kitts and Nevis", LAC, "XCD", "en"],
  ["LC", "Saint Lucia", "Saint Lucia", LAC, "XCD", "en"],
  ["MX", "Mexico", "México", LAC, "MXN", "es"],
  ["NI", "Nicaragua", "Nicaragua", LAC, "NIO", "es"],
  ["PA", "Panama", "Panamá", LAC, "PAB", "es"],
  ["PE", "Peru", "Perú", LAC, "PEN", "es qu"],
  ["PY", "Paraguay", "Paraguay", LAC, "PYG", "es gn"],
  ["SR", "Suriname", "Suriname", LAC, "SRD", "nl"],
  ["SV", "El Salvador", "El Salvador", LAC, "USD", "es"],
  ["TT", "Trinidad and Tobago", "Trinidad and Tobago", LAC, "TTD", "en"],
  ["UY", "Uruguay", "Uruguay", LAC, "UYU", "es"],
  ["VC", "Saint Vincent and the Grenadines", "Saint Vincent and the Grenadines", LAC, "XCD", "en"],
  ["VE", "Venezuela", "Venezuela", LAC, "VES", "es"],

  // Middle East and North Africa
  ["AE", "United Arab Emirates", "الإمارات", MENA, "AED", "ar en hi ur"],
  ["BH", "Bahrain", "البحرين", MENA, "BHD", "ar en"],
  ["DJ", "Djibouti", "Djibouti", MENA, "DJF", "so fr ar"],
  ["DZ", "Algeria", "الجزائر", MENA, "DZD", "ar fr"],
  ["EG", "Egypt", "مصر", MENA, "EGP", "ar en"],
  ["IL", "Israel", "ישראל", MENA, "ILS", "he ar en ru"],
  ["IQ", "Iraq", "العراق", MENA, "IQD", "ar ku"],
  ["IR", "Iran", "ایران", MENA, "IRR", "fa"],
  ["JO", "Jordan", "الأردن", MENA, "JOD", "ar en"],
  ["KW", "Kuwait", "الكويت", MENA, "KWD", "ar en"],
  ["LB", "Lebanon", "لبنان", MENA, "LBP", "ar fr en"],
  ["LY", "Libya", "ليبيا", MENA, "LYD", "ar"],
  ["MA", "Morocco", "المغرب", MENA, "MAD", "ar fr"],
  ["MT", "Malta", "Malta", MENA, "EUR", "mt en"],
  ["OM", "Oman", "عُمان", MENA, "OMR", "ar en"],
  ["PS", "Palestine", "فلسطين", MENA, "ILS", "ar"],
  ["QA", "Qatar", "قطر", MENA, "QAR", "ar en"],
  ["SA", "Saudi Arabia", "السعودية", MENA, "SAR", "ar"],
  ["SY", "Syria", "سوريا", MENA, "SYP", "ar"],
  ["TN", "Tunisia", "تونس", MENA, "TND", "ar fr"],
  ["YE", "Yemen", "اليمن", MENA, "YER", "ar"],

  // North America
  ["CA", "Canada", "Canada", NA, "CAD", "en fr"],
  ["US", "United States", "United States", NA, "USD", "en es"],

  // Sub-Saharan Africa
  ["AO", "Angola", "Angola", SSA, "AOA", "pt"],
  ["BF", "Burkina Faso", "Burkina Faso", SSA, "XOF", "fr"],
  ["BI", "Burundi", "Uburundi", SSA, "BIF", "rn fr sw"],
  ["BJ", "Benin", "Bénin", SSA, "XOF", "fr yo"],
  ["BW", "Botswana", "Botswana", SSA, "BWP", "tn en"],
  ["CD", "DR Congo", "RD Congo", SSA, "CDF", "fr ln sw kg"],
  ["CF", "Central African Republic", "Centrafrique", SSA, "XAF", "sg fr"],
  ["CG", "Congo", "Congo", SSA, "XAF", "fr ln kg"],
  ["CI", "Côte d’Ivoire", "Côte d’Ivoire", SSA, "XOF", "fr"],
  ["CM", "Cameroon", "Cameroun", SSA, "XAF", "fr en"],
  ["CV", "Cabo Verde", "Cabo Verde", SSA, "CVE", "pt"],
  ["ER", "Eritrea", "ኤርትራ", SSA, "ERN", "ti ar en"],
  ["ET", "Ethiopia", "ኢትዮጵያ", SSA, "ETB", "am om ti so"],
  ["GA", "Gabon", "Gabon", SSA, "XAF", "fr"],
  ["GH", "Ghana", "Ghana", SSA, "GHS", "en ak ee"],
  ["GM", "Gambia", "Gambia", SSA, "GMD", "en wo ff"],
  ["GN", "Guinea", "Guinée", SSA, "GNF", "fr ff"],
  ["GQ", "Equatorial Guinea", "Guinea Ecuatorial", SSA, "XAF", "es fr pt"],
  ["GW", "Guinea-Bissau", "Guiné-Bissau", SSA, "XOF", "pt"],
  ["KE", "Kenya", "Kenya", SSA, "KES", "sw en"],
  ["KM", "Comoros", "Comores", SSA, "KMF", "fr ar"],
  ["LR", "Liberia", "Liberia", SSA, "LRD", "en"],
  ["LS", "Lesotho", "Lesotho", SSA, "LSL", "st en"],
  ["MG", "Madagascar", "Madagasikara", SSA, "MGA", "mg fr"],
  ["ML", "Mali", "Mali", SSA, "XOF", "bm fr"],
  ["MR", "Mauritania", "موريتانيا", SSA, "MRU", "ar fr"],
  ["MU", "Mauritius", "Mauritius", SSA, "MUR", "en fr"],
  ["MW", "Malawi", "Malawi", SSA, "MWK", "ny en"],
  ["MZ", "Mozambique", "Moçambique", SSA, "MZN", "pt"],
  ["NA", "Namibia", "Namibia", SSA, "NAD", "en af de"],
  ["NE", "Niger", "Niger", SSA, "XOF", "ha fr"],
  ["NG", "Nigeria", "Nigeria", SSA, "NGN", "en ha yo ig"],
  ["RW", "Rwanda", "Rwanda", SSA, "RWF", "rw en fr sw"],
  ["SC", "Seychelles", "Seychelles", SSA, "SCR", "en fr"],
  ["SD", "Sudan", "السودان", SSA, "SDG", "ar en"],
  ["SL", "Sierra Leone", "Sierra Leone", SSA, "SLE", "en"],
  ["SN", "Senegal", "Sénégal", SSA, "XOF", "wo fr"],
  ["SO", "Somalia", "Soomaaliya", SSA, "SOS", "so ar"],
  ["SS", "South Sudan", "South Sudan", SSA, "SSP", "en ar"],
  ["ST", "São Tomé and Príncipe", "São Tomé e Príncipe", SSA, "STN", "pt"],
  ["SZ", "Eswatini", "eSwatini", SSA, "SZL", "ss en"],
  ["TD", "Chad", "Tchad", SSA, "XAF", "fr ar"],
  ["TG", "Togo", "Togo", SSA, "XOF", "fr ee"],
  ["TZ", "Tanzania", "Tanzania", SSA, "TZS", "sw en"],
  ["UG", "Uganda", "Uganda", SSA, "UGX", "en sw lg"],
  ["ZA", "South Africa", "South Africa", SSA, "ZAR", "en zu xh af"],
  ["ZM", "Zambia", "Zambia", SSA, "ZMW", "en ny"],
  ["ZW", "Zimbabwe", "Zimbabwe", SSA, "ZWG", "en sn nd"],
];

/** Country languages that are UI locales (in order), then English: same rule as the engine's localesForLanguages. */
export function localesFor(languages: readonly string[]): Locale[] {
  const out: Locale[] = [];
  for (const l of languages) if ((UI_LOCALES as readonly string[]).includes(l) && l !== "en" && !out.includes(l as Locale)) out.push(l as Locale);
  out.push("en");
  return out;
}

export const COUNTRY_INDEX: CountryIndexEntry[] = ROWS.map(([code, nameEn, nameNative, region, currency, langs]) => {
  const languages = langs.split(" ");
  return { code, nameEn, nameNative, region, currency, languages, locales: localesFor(languages) };
});
