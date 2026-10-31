import { describe, expect, it } from "vitest";
import {
  BDT_CURRENCY,
  formatAsOf,
  formatMoney,
  formatMonths,
  formatNumber,
  formatPercent,
  formatTaka,
  fromBanglaDigits,
  groupIndian,
  parseMoneyInput,
  parseTakaInput,
  toBanglaDigits,
  toLatinDigits,
  type MoneyCurrency,
} from "./format";

describe("digits and grouping", () => {
  it("converts digits both ways", () => {
    expect(toBanglaDigits("1234567890")).toBe("১২৩৪৫৬৭৮৯০");
    expect(fromBanglaDigits("১২,৫০,০০০")).toBe("12,50,000");
    expect(fromBanglaDigits(toBanglaDigits("2026-09-30"))).toBe("2026-09-30");
  });
  it("groups in lakh/crore style", () => {
    expect(groupIndian(0)).toBe("0");
    expect(groupIndian(999)).toBe("999");
    expect(groupIndian(1000)).toBe("1,000");
    expect(groupIndian(12345)).toBe("12,345");
    expect(groupIndian(123456)).toBe("1,23,456");
    expect(groupIndian(1250000)).toBe("12,50,000");
    expect(groupIndian(123456789)).toBe("12,34,56,789");
    expect(groupIndian(-250000)).toBe("-2,50,000");
  });
});

describe("formatTaka", () => {
  it("formats grouped taka in both digit systems", () => {
    expect(formatTaka(1250000, { digits: "latn" })).toBe("৳12,50,000");
    expect(formatTaka(1250000, { digits: "bn" })).toBe("৳১২,৫০,০০০");
    expect(formatTaka(9000, { digits: "latn" })).toBe("৳9,000");
  });
  it("formats compact lakh and crore", () => {
    expect(formatTaka(899000, { digits: "latn", compact: true })).toBe("৳9.0 lakh");
    expect(formatTaka(899000, { digits: "bn", compact: true })).toBe("৳৯.০ লাখ");
    expect(formatTaka(12000000, { digits: "latn", compact: true })).toBe("৳1.2 crore");
    expect(formatTaka(12000000, { digits: "bn", compact: true })).toBe("৳১.২ কোটি");
    expect(formatTaka(45000, { digits: "latn", compact: true })).toBe("৳45,000");
  });
  it("handles signs", () => {
    expect(formatTaka(-1500, { digits: "latn" })).toBe("−৳1,500");
    expect(formatTaka(1500, { digits: "latn", sign: true })).toBe("+৳1,500");
  });
});

describe("percent, number, months, asOf", () => {
  it("formats percentages with one decimal by default", () => {
    expect(formatPercent(0.0834, { digits: "latn" })).toBe("8.3%");
    expect(formatPercent(0.1183, { digits: "latn", decimals: 2 })).toBe("11.83%");
    expect(formatPercent(-0.0147, { digits: "latn" })).toBe("−1.5%");
    expect(formatPercent(0.0834, { digits: "bn" })).toBe("৮.৩%");
  });
  it("formats plain numbers and months", () => {
    expect(formatNumber(2.04, { digits: "latn", decimals: 1 })).toBe("2.0");
    expect(formatMonths(8, "en")).toBe("8 months");
    expect(formatMonths(1, "en")).toBe("1 month");
    expect(formatMonths(2.5, "bn")).toBe("২.৫ মাস");
  });
  it("formats as-of dates", () => {
    expect(formatAsOf("2026-09-30", "en")).toBe("Sep 2026");
    expect(formatAsOf("2026-09-30", "bn")).toBe("সেপ্টেম্বর ২০২৬");
    expect(formatAsOf("garbage", "en")).toBe("garbage");
  });
});

describe("parseTakaInput", () => {
  it("accepts grouped, Bangla and compact forms", () => {
    expect(parseTakaInput("12,50,000")).toBe(1250000);
    expect(parseTakaInput("১২৫০০০")).toBe(125000);
    expect(parseTakaInput("12.5 lakh")).toBe(1250000);
    expect(parseTakaInput("১.২ কোটি")).toBe(12000000);
    expect(parseTakaInput("৳ 5000")).toBe(5000);
    expect(parseTakaInput("50k")).toBe(50000);
  });
  it("returns null for junk", () => {
    expect(parseTakaInput("")).toBeNull();
    expect(parseTakaInput("abc")).toBeNull();
    expect(parseTakaInput("12 taka 50")).toBeNull();
  });
});

const INR: MoneyCurrency = { code: "INR", symbol: "₹", decimals: 2, compact: "lakh_crore" };
const USD: MoneyCurrency = { code: "USD", symbol: "$", decimals: 2, compact: "intl" };
const JPY: MoneyCurrency = { code: "JPY", symbol: "¥", decimals: 0, compact: "intl" };
const EUR: MoneyCurrency = { code: "EUR", symbol: "€", decimals: 2, compact: "intl" };
const spaces = (s: string) => s.replace(/[  ]/g, " ");

describe("formatMoney", () => {
  it("BDT in bn and en is exactly formatTaka", () => {
    for (const n of [0, 9000, 45000, 899000, 1250000, 12000000, -1500]) {
      for (const compact of [false, true]) {
        expect(formatMoney(n, { currency: BDT_CURRENCY, locale: "en", digits: "latn", compact })).toBe(formatTaka(n, { digits: "latn", compact }));
        expect(formatMoney(n, { currency: BDT_CURRENCY, locale: "bn-BD", digits: "bn", compact })).toBe(formatTaka(n, { digits: "bn", compact }));
      }
    }
    expect(formatMoney(1500, { currency: BDT_CURRENCY, locale: "en", digits: "latn", sign: true })).toBe("+৳1,500");
  });

  it("INR uses lakh grouping and lakh/crore words", () => {
    expect(formatMoney(1250000, { currency: INR, locale: "en", digits: "latn" })).toBe("₹12,50,000");
    expect(formatMoney(1250000, { currency: INR, locale: "en", digits: "latn", compact: true })).toBe("₹12.5 lakh");
    expect(formatMoney(12000000, { currency: INR, locale: "bn-BD", digits: "bn", compact: true })).toBe("₹১.২ কোটি");
    // Hindi: Intl's own Indian grouping and compact words.
    expect(formatMoney(1250000, { currency: INR, locale: "hi-IN", digits: "latn" })).toBe("₹12,50,000");
    expect(spaces(formatMoney(1250000, { currency: INR, locale: "hi-IN", digits: "latn", compact: true }))).toBe("₹12.5 लाख");
  });

  it("USD, JPY and EUR use the locale's grouping and no minor units", () => {
    expect(formatMoney(1250000, { currency: USD, locale: "en", digits: "latn" })).toBe("$1,250,000");
    expect(formatMoney(1249.6, { currency: USD, locale: "en", digits: "latn" })).toBe("$1,250");
    expect(formatMoney(1250000.4, { currency: JPY, locale: "en", digits: "latn" })).toBe("¥1,250,000");
    expect(spaces(formatMoney(1250000, { currency: EUR, locale: "fr", digits: "latn" }))).toBe("1 250 000 €");
  });

  it("compact uses Intl notation outside lakh/crore", () => {
    expect(formatMoney(1250000, { currency: USD, locale: "en", digits: "latn", compact: true })).toBe("$1.3M");
    expect(formatMoney(45000, { currency: USD, locale: "en", digits: "latn", compact: true })).toBe("$45K");
    expect(spaces(formatMoney(1250000, { currency: EUR, locale: "fr", digits: "latn", compact: true }))).toBe("1,3 M €");
  });

  it("signs: the minus sign for negatives, + on request", () => {
    expect(formatMoney(-1500, { currency: USD, locale: "en", digits: "latn" })).toBe("−$1,500");
    expect(formatMoney(1500, { currency: USD, locale: "en", digits: "latn", sign: true })).toBe("+$1,500");
    expect(formatMoney(-1500, { currency: INR, locale: "en", digits: "latn" })).toBe("−₹1,500");
    expect(formatMoney(-0.2, { currency: USD, locale: "en", digits: "latn" })).toBe("$0");
  });

  it("Bangla digits for any currency, and a safe fallback for a malformed code", () => {
    expect(formatMoney(1250000, { currency: USD, locale: "bn-BD", digits: "bn" })).toContain("১২,৫০,০০০");
    expect(formatMoney(1000, { currency: { ...USD, code: "??" }, locale: "en", digits: "latn" })).toBe("1,000");
  });
});

describe("parseMoneyInput", () => {
  it("reads every script", () => {
    expect(toLatinDigits("১২৩ ١٢٣ ۱۲۳ १२३")).toBe("123 123 123 123");
    expect(parseMoneyInput("١٢٥٠٠٠")).toBe(125000);
    expect(parseMoneyInput("۱۲۵۰۰۰")).toBe(125000);
    expect(parseMoneyInput("१२,५०,०००")).toBe(1250000);
    expect(parseMoneyInput("১২,৫০,০০০")).toBe(1250000);
  });

  it("ignores symbols and grouping in any style", () => {
    expect(parseMoneyInput("₹12,50,000")).toBe(1250000);
    expect(parseMoneyInput("$1,250,000")).toBe(1250000);
    expect(parseMoneyInput("1 250 000 €")).toBe(1250000);
    expect(parseMoneyInput("1 250 000 €")).toBe(1250000);
    expect(parseMoneyInput("1.250.000")).toBe(1250000);
    expect(parseMoneyInput("1'250'000")).toBe(1250000);
    expect(parseMoneyInput("1.250.000,50")).toBe(1250001);
    expect(parseMoneyInput("1,250,000.40")).toBe(1250000);
    expect(parseMoneyInput("1,250")).toBe(1250);
    expect(parseMoneyInput("12.5")).toBe(13);
    expect(parseMoneyInput("Rs 5,000", { symbol: "Rs" })).toBe(5000);
    expect(parseMoneyInput("KSh 5000", { symbol: "KSh" })).toBe(5000);
  });

  it("reads multiplier words", () => {
    expect(parseMoneyInput("12.5 lakh")).toBe(1250000);
    expect(parseMoneyInput("2 करोड़")).toBe(20000000);
    expect(parseMoneyInput("5 हज़ार")).toBe(5000);
    expect(parseMoneyInput("2.5m")).toBe(2500000);
    expect(parseMoneyInput("1.2 million")).toBe(1200000);
    expect(parseMoneyInput("50K")).toBe(50000);
  });

  it("rejects text that is not one amount", () => {
    expect(parseMoneyInput("")).toBeNull();
    expect(parseMoneyInput("1,2.3,4")).toBeNull();
    expect(parseMoneyInput("12 taka 50")).toBeNull();
    expect(parseMoneyInput("5 apples")).toBeNull();
  });
});

const SAR: MoneyCurrency = { code: "SAR", symbol: "﷼", decimals: 2, compact: "intl" };
const KWD: MoneyCurrency = { code: "KWD", symbol: "د.ك", decimals: 3, compact: "intl" };
const PKR: MoneyCurrency = { code: "PKR", symbol: "Rs", decimals: 2, compact: "lakh_crore" };
const LOCALE_TAGS = ["en", "bn-BD", "ar", "hi-IN", "fr"] as const;

describe("formatMoney ↔ parseMoneyInput round trips", () => {
  const amounts = [0, 7, 999, 1000, 1250, 45000, 899000, 1250000, 12000000, 987654321, -1500, -1250000];
  for (const currency of [INR, USD, JPY, EUR, SAR, KWD, BDT_CURRENCY, PKR]) {
    for (const locale of LOCALE_TAGS) {
      it(`${currency.code} in ${locale}`, () => {
        const digits = locale.startsWith("bn") ? "bn" : "latn";
        for (const n of amounts) {
          const shown = formatMoney(n, { currency, locale, digits });
          expect(parseMoneyInput(shown, { symbol: currency.symbol, code: currency.code, locale }), shown).toBe(n);
          // Without the code (useFormat passes only the symbol) the usual currency forms still go.
          expect(parseMoneyInput(shown, { symbol: currency.symbol, locale }), `${shown} (no code)`).toBe(n);
        }
      });
    }
  }

  it("compact figures read back close to the amount", () => {
    for (const currency of [INR, USD, EUR, SAR]) {
      for (const locale of LOCALE_TAGS) {
        const digits = locale.startsWith("bn") ? "bn" : "latn";
        const shown = formatMoney(1250000, { currency, locale, digits, compact: true });
        const back = parseMoneyInput(shown, { symbol: currency.symbol, code: currency.code, locale });
        expect(back, shown).not.toBeNull();
        expect(Math.abs((back ?? 0) - 1250000) / 1250000, shown).toBeLessThan(0.05);
      }
    }
  });
});

describe("formatMoney details", () => {
  it("Bangla puts the symbol before the number for Intl currencies", () => {
    expect(formatMoney(1250000, { currency: USD, locale: "bn-BD", digits: "bn" })).toBe("$১২,৫০,০০০");
    expect(formatMoney(-1500, { currency: EUR, locale: "bn-BD", digits: "bn" })).toBe("−€১,৫০০");
    expect(spaces(formatMoney(1250, { currency: SAR, locale: "bn-BD", digits: "bn" }))).toBe("SAR ১,২৫০");
  });
  it("puts a space after a letter symbol in lakh/crore style", () => {
    expect(spaces(formatMoney(1250000, { currency: PKR, locale: "en", digits: "latn" }))).toBe("Rs 12,50,000");
    expect(spaces(formatMoney(-1500, { currency: { ...PKR, code: "NPR" }, locale: "en", digits: "latn" }))).toBe("−Rs 1,500");
    expect(formatMoney(1500, { currency: INR, locale: "en", digits: "latn" })).toBe("₹1,500");
  });
  it("rounds negatives like positives", () => {
    expect(formatMoney(-2.5, { currency: USD, locale: "en", digits: "latn" })).toBe("−$3");
    expect(formatMoney(2.5, { currency: USD, locale: "en", digits: "latn" })).toBe("$3");
    expect(formatMoney(-2.5, { currency: INR, locale: "en", digits: "latn" })).toBe("−₹3");
    expect(formatMoney(-0.4, { currency: INR, locale: "en", digits: "latn" })).toBe("₹0");
    expect(groupIndian(-2.5)).toBe("-3");
    expect(formatPercent(-0.125, { digits: "latn", decimals: 0 })).toBe("−13%");
    expect(formatPercent(0.125, { digits: "latn", decimals: 0 })).toBe("13%");
    expect(parseMoneyInput("-12.5")).toBe(-13);
    expect(parseMoneyInput("12.5")).toBe(13);
  });
});

describe("parseMoneyInput currency tokens", () => {
  it("strips the symbol only as a whole token at the start or end", () => {
    // "R" (rand) must not eat the r of crore.
    expect(parseMoneyInput("2 crore", { symbol: "R" })).toBe(20000000);
    expect(parseMoneyInput("R 5 000", { symbol: "R" })).toBe(5000);
    expect(parseMoneyInput("5R000", { symbol: "R" })).toBeNull();
    expect(parseMoneyInput("5.000 kr.", { symbol: "kr.", code: "DKK" })).toBe(5000);
  });
  it("ignores bidi marks, ISO codes and Intl's own symbols", () => {
    expect(parseMoneyInput("‏‎-1,250,000 ر.س.‏", { code: "SAR", locale: "ar" })).toBe(-1250000);
    expect(parseMoneyInput("SAR 1,250")).toBe(1250);
    expect(parseMoneyInput("1 250 KWD")).toBe(1250);
    expect(parseMoneyInput("US$ 500", { symbol: "$", code: "USD" })).toBe(500);
    expect(parseMoneyInput("؜500")).toBe(500);
    expect(parseMoneyInput("$-500")).toBe(-500);
    expect(parseMoneyInput("--500")).toBeNull();
  });
  it("reads East Asian, Russian and Arabic multipliers", () => {
    expect(parseMoneyInput("5万")).toBe(50000);
    expect(parseMoneyInput("5万円")).toBe(50000);
    expect(parseMoneyInput("3億")).toBe(300000000);
    expect(parseMoneyInput("2亿")).toBe(200000000);
    expect(parseMoneyInput("5만")).toBe(50000);
    expect(parseMoneyInput("1억")).toBe(100000000);
    expect(parseMoneyInput("5000円")).toBe(5000);
    expect(parseMoneyInput("5 тыс")).toBe(5000);
    expect(parseMoneyInput("5 тыс.")).toBe(5000);
    expect(parseMoneyInput("1,5 млн")).toBe(1500000);
    expect(parseMoneyInput("٥ ألف")).toBe(5000);
    expect(parseMoneyInput("2 مليون")).toBe(2000000);
  });
});
