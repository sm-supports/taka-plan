import type { Dictionary } from "../../types";

export const explainM6: Dictionary["explain"]["m6"] = {
  score: {
    title: "जोखिम स्कोर",
    body: "चारों जवाबों में से हर एक को 0 से 2 अंक मिलते हैं: उम्र वर्ग {ageBandCount}, आय {incomeCount}, पैसा कब चाहिए {horizonCount}, और 20% गिरावट के बाद आप क्या करेंगे {reactionCount}। कुल: 8 में से {result}। 0 से 3 सावधान, 4 से 5 संतुलित, 6 से 8 ग्रोथ।",
  },
  equity: {
    title: "इक्विटी का हिस्सा",
    body: "आपकी प्रोफ़ाइल 30 की उम्र तक {startShare} इक्विटी से शुरू होती है, फिर उसके बाद हर साल एक अंक कम, पर कभी {floorShare} से नीचे नहीं: {ageYears} पर यह {ageEquityShare} होता है, और कभी {capShare} की सीमा से ऊपर नहीं। {noEquityYears} साल के अंदर चाहिए पैसे में कोई इक्विटी नहीं, और {cashOnlyYears} साल के अंदर केवल जमा या ट्रेज़री बिल; आपको यह पैसा {horizonYears} साल में चाहिए। इक्विटी: {result}।",
  },
  gold: {
    title: "सोने का हिस्सा",
    body: "सोना जोखिम से बचाव है, दाँव नहीं: आपकी पसंद {chosenShare}, {minShare} और {maxShare} के बीच रखी गई। सोना: {result}।",
  },
  fixedIncome: {
    title: "निश्चित आय का हिस्सा",
    body: "जो कुछ इक्विटी या सोना नहीं है: 100% − {equityShare} − {goldShare} = {result}।",
  },
  mixLow: {
    title: "मिक्स का रिटर्न, कम वाली स्थिति",
    body: "हर हिस्से का कम वाली स्थिति का सालाना रिटर्न, उसके हिस्से के भार से: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = सालाना {result}।",
  },
  mixBase: {
    title: "मिक्स का रिटर्न, सामान्य स्थिति",
    body: "हर हिस्से का सामान्य स्थिति का सालाना रिटर्न, उसके हिस्से के भार से: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = सालाना {result}। इक्विटी का सामान्य रिटर्न जान-बूझकर सुरक्षित साधनों से ऊँचा नहीं रखा गया है।",
  },
  mixHigh: {
    title: "मिक्स का रिटर्न, ज़्यादा वाली स्थिति",
    body: "हर हिस्से का ज़्यादा वाली स्थिति का सालाना रिटर्न, उसके हिस्से के भार से: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = सालाना {result}।",
  },
  fv: {
    title: "यह कितना बढ़ सकता है (सामान्य स्थिति)",
    body: "हर महीने {monthly} और आज {lumpSum}, {years} साल तक सालाना {mixRate} (मासिक {monthlyRate}) की दर से बढ़ते हुए। आप {paidIn} जमा करते हैं; अंत में आपके पास {result} हो सकते हैं। कम और ज़्यादा वाली स्थितियाँ अपना-अपना मिक्स रिटर्न इस्तेमाल करती हैं।",
  },
  real: {
    title: "आज के पैसे में",
    body: "कीमतें भी बढ़ती हैं। {fv} भाग (1 + {inflation})^{years} = आज के पैसे में {result}।",
  },
  trade: {
    title: "रीबैलेंस की खरीद-बिक्री",
    body: "आपके पास {holdingsTotal} है और आप {newMoney} जोड़ते हैं, इसलिए नया कुल {result} है। हर हिस्से का लक्ष्य उस कुल में उसका हिस्सा है ({equityShare}, {goldShare}, {fixedIncomeShare}), घटाकर अभी जो उसमें है: इक्विटी {equityTrade}, सोना {goldTrade}, निश्चित आय {fixedIncomeTrade} (प्लस = खरीदें, माइनस = बेचें)। नया पैसा पहले पीछे वाले हिस्सों में जाता है, और लक्ष्य से {driftBandShare} से ज़्यादा दूर कोई हिस्सा रीबैलेंस का संकेत है।",
  },
};
