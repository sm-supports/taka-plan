import type { Dictionary } from "../../types";

export const explainM7: Dictionary["explain"]["m7"] = {
  spendingAtRetirement: {
    title: "रिटायरमेंट के पहले साल का खर्च",
    body: "आज का मासिक खर्च {monthlySpending}, गुणा 12, काम बंद करने तक के {retireInYears} सालों में {inflation} सालाना की दर से कीमतों के साथ बढ़ाकर: 12 × {monthlySpending} × (1 + {inflation})^{retireInYears}। मिलने वाला किराया पहले घटाया जाता है, क्योंकि वह भी कीमतों के साथ बढ़ता है। नतीजा: सालाना {result}।",
  },
  corpusContrast: {
    title: "तुलना वाली उम्र तक का लक्ष्य",
    body: "वह रकम जो पहले साल {spendingAtRetirement} दे, कीमतों ({inflation}) के साथ बढ़ते हुए, {retiredForYears} साल तक, जबकि बाकी टैक्स के बाद {returnRate} कमाती है: {spendingAtRetirement} × (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) ÷ ({returnRate} − {inflation}) = {result}। केवल तुलना के लिए दिखाया गया है।",
  },
  corpusPlan: {
    title: "आपकी प्लान वाली उम्र तक चलने का लक्ष्य",
    body: "वही फ़ॉर्मूला {retiredForYears} सालों पर: {spendingAtRetirement} × (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) ÷ ({returnRate} − {inflation}) = {result}। यही वह रकम है जिसे साल दर साल वाला चार्ट उस उम्र पर शून्य तक खर्च करता है।",
  },
  savingsFv: {
    title: "काम बंद करते समय आपकी बचत",
    body: "आज आपके पास जो है, {savings}, {retireInYears} साल तक सालाना {accumulationRate} पर निवेश में रहे: {savings} × (1 + {accumulationRate})^{retireInYears} = {result}।",
  },
  providentFund: {
    title: "काम बंद करते समय भविष्य निधि",
    body: "आज का बैलेंस {balance} और हर महीने जमा {monthlyContribution}, दोनों फ़ंड की अपनी दर {fundRate} से {retireInYears} साल तक बढ़ते हुए = {result}।",
  },
  gratuity: {
    title: "ग्रेच्युटी",
    body: "आखिरी मूल वेतन {basicMonthly} ÷ {daysPerMonthCount} दिन × सेवा के {serviceYears} सालों में से हर साल के लिए {daysCount} दिन = {result}, नौकरी छोड़ने पर एकमुश्त मिलता है।",
  },
  fixedPensions: {
    title: "तय पेंशन, काम बंद करते समय का मूल्य",
    body: "{pensionFromAgeYears} की उम्र से हर महीने {publicPensionMonthly} की सरकारी पेंशन और हर महीने {fixedPensionMonthly} की दूसरी तय आय, जो आपकी प्लान वाली उम्र तक ({retiredForYears} साल का रिटायरमेंट) कीमतों के साथ बढ़े बिना मिलती है, काम बंद करते समय {returnRate} पर इतनी कीमत की है: {result}। इसीलिए लंबे रिटायरमेंट में इनकी खरीदने की ताकत घटती जाती है।",
  },
  gap: {
    title: "अभी और जुटाना है",
    body: "{corpus} का लक्ष्य, घटाकर वह सब जो पहले से मौजूद होगा (आपकी बचत, भविष्य निधि, ग्रेच्युटी और तय पेंशन का मूल्य), कभी शून्य से नीचे नहीं: {result}।",
  },
  monthly: {
    title: "हर महीने की बचत",
    body: "वह रकम जो {savingMonths} महीनों तक हर महीने जमा हो और मासिक {monthlyRate} पर बढ़े, तो {gap} बन जाए: {gap} × {monthlyRate} ÷ ((1 + {monthlyRate})^{savingMonths} − 1) = {result}, ऊपर की ओर गोल किया गया ताकि काफ़ी हो।",
  },
  withdrawal: {
    title: "पहले साल की निकासी",
    body: "{savings} पहले साल कितना दे सकता है, उसके बाद हर साल कीमतों ({inflation}) के साथ बढ़ते हुए, ताकि {returnRate} कमाते हुए यह {retiredForYears} साल चले: {savings} × ({returnRate} − {inflation}) ÷ (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) = {result}, नीचे की ओर गोल किया गया ताकि कभी कम न पड़े।",
  },
  safePot: {
    title: "सुरक्षित घड़ा",
    body: "पहले साल की निकासी {firstYear} गुणा {potYears} साल = {result}, किसी सुरक्षित और जल्दी पहुँच वाली जगह रखा गया।",
  },
};
