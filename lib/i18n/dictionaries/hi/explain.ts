// Input names per step are documented in ../en/explain.ts; the placeholders here must match.
import type { Dictionary } from "../../types";
import { explainM2 } from "./explain-m2";
import { explainM6 } from "./explain-m6";
import { explainM7 } from "./explain-m7";

export const explain: Dictionary["explain"] = {
  m2: explainM2,
  m6: explainM6,
  m7: explainM7,
  m1: {
    months: {
      title: "कितने महीनों का खर्च",
      body: "हम {base} महीनों से शुरू करते हैं। अनियमित आय पर {bumpIrregular} जुड़ते हैं, आश्रितों के साथ अकेले कमाने वाले होने पर {bumpSoleEarner}, और स्वास्थ्य बीमा न होने पर {bumpNoHealth}। सुझाव {min} से {max} महीनों के बीच रहता है: {result}। स्लाइडर आपके हाथ में है।",
    },
    target: {
      title: "आपातकालीन फ़ंड का लक्ष्य",
      body: "आपका मासिक ज़रूरी खर्च गुणा कवर के महीने: {essentials} × {months} = {result}। केवल ज़रूरी खर्च गिना जाता है, क्योंकि आपात स्थिति में बाकी सब रुक जाता है।",
    },
    gap: {
      title: "अभी और बचाना है",
      body: "लक्ष्य में से वह घटाएँ जो आज ही हाथ में आ सकता है: {target} − {saved} = {result}। यह कभी शून्य से नीचे नहीं जाता; प्लान से बड़ा फ़ंड होना ठीक है।",
    },
    monthly: {
      title: "हर महीने की बचत",
      body: "कमी को उन महीनों में बाँटा गया जो आपने फ़ंड बनाने के लिए चुने: {gap} ÷ {buildMonths} = हर महीने {result}।",
    },
    covered: {
      title: "कितने महीने कवर हैं",
      body: "आपकी अभी की बचत कितने महीनों का ज़रूरी खर्च चला सकती है: {saved} ÷ {essentials} = {result}।",
    },
    tier1: {
      title: "परत 1: उसी दिन निकलने वाला बचत खाता",
      body: "एक महीने का ज़रूरी खर्च ऐसे बचत खाते में रहता है जिससे आज ही निकाला जा सके: {essentials} = {result}। किसी भी आपात स्थिति के पहले हफ़्ते का पैसा यही है।",
    },
    tier2: {
      title: "परत 2: 3 महीने की FDR सीढ़ी",
      body: "परत 1 से ऊपर सब FDR में जाता है: {target} − {tier1} = {result}, तीन FDR में बाँटकर, एक-एक महीने के अंतर पर खोली गई, ताकि हर महीने एक मैच्योर हो।",
    },
    banks: {
      title: "कितने बैंक चाहिए",
      body: "जमा बीमा हर बैंक में {limit} तक सुरक्षा देता है, और पूरा फ़ंड बैंक जमा में रहता है, इसलिए लक्ष्य बाँटा जाता है: {target} ÷ {limit}, ऊपर की ओर पूर्णांक, = {result} बैंक।",
    },
  },

  m3: {
    totalEmi: {
      title: "कुल मासिक EMI",
      body: "सभी लोन की EMI और कार्ड के हर बकाये पर न्यूनतम भुगतान: {emis} + {cardMinimums} = {result}।",
    },
    emiRatio: {
      title: "टेक-होम में EMI का हिस्सा",
      body: "कुल EMI भाग टेक-होम: {totalEmi} ÷ {takeHome} = {result}। कर्ज़ देने वाले अपनी सीमा खुद तय करते हैं; हम ऊँचे हिस्से पर चेतावनी देते हैं, क्योंकि तब बचत के लिए बहुत कम बचता है।",
    },
    capacity: {
      title: "EMI की क्षमता",
      body: "पहले बचत, फिर ज़रूरी खर्च और नकद गुंजाइश के बाद लोन चुकाने के लिए जो बचता है: {takeHome} − {savings} − {essentials} − {buffer} = {result}।",
    },
    maxLoan: {
      title: "ज़्यादा से ज़्यादा लेने लायक लोन",
      body: "EMI का आम फ़ॉर्मूला उल्टा चलाकर। {months} महीनों के लिए {monthlyRate} की मासिक दर पर: {capacity} × (1 − (1 + {monthlyRate})^−{months}) ÷ {monthlyRate} = {result}। उधार लेने से पहले अपनी तरफ़ से सुरक्षा की गुंजाइश रखें।",
    },
    scenarioEmi: {
      title: "इस लोन की मासिक EMI",
      body: "EMI का आम फ़ॉर्मूला। {principal} के लिए {monthlyRate} की मासिक दर पर {months} महीनों के लिए: {principal} × {monthlyRate} ÷ (1 − (1 + {monthlyRate})^−{months}) = {result}।",
    },
    interestSaved: {
      title: "बचा ब्याज",
      body: "सबसे ऊँची दर वाला कर्ज़ पहले चुकाने पर कुल ब्याज {avalancheInterest} लगता है; सबसे छोटा बकाया पहले चुकाने पर {snowballInterest}। अंतर, {result}, वह है जो ऊँची दर पहले चुकाने से बचता है।",
    },
  },

  m4: {
    average: {
      title: "औसत मासिक आय",
      body: "आय का औसत पिछले {months} महीनों पर लिया गया है: {total} ÷ {months} = {result}। तय तनख्वाह में यह बस आपका टेक-होम है; फ़्रीलांसर और व्यवसायी पिछले छह महीने भरें, ताकि उतार-चढ़ाव बराबर हो जाए।",
    },
    feasible: {
      title: "ज़्यादा से ज़्यादा बचत",
      body: "ज़रूरी खर्च के बाद जो बचता है, आय के हिस्से के रूप में: ({average} − {essentials}) ÷ {average} = {result}। सुझाई गई दर कभी इससे ऊपर नहीं जाती।",
    },
    amount: {
      title: "हर महीने की बचत",
      body: "आय गुणा आपकी बचत दर: {average} × {rate} = {result}। यह तनख्वाह के दिन, कुछ भी खर्च होने से पहले, बचत में जाता है।",
    },
    expenses: {
      title: "खर्च के लिए बचा",
      body: "आय में से बचत घटाकर जो बचता है, उसी पर आप गुज़ारा करते हैं: {average} − {savings} = {result}। पूरी बात यही है: पहले बचत, फिर बाकी खर्च।",
    },
  },

  m5: {
    fv: {
      title: "लक्ष्य की भविष्य की कीमत",
      body: "आज की कीमत, लक्ष्य तक हर साल महँगाई से बढ़ाकर: {cost} × (1 + {inflation})^{years} = {result}। असल में आपको इसी संख्या तक पहुँचना है।",
    },
    rate: {
      title: "टैक्स के बाद रिटर्न",
      body: "{instrument} टैक्स से पहले सालाना {nominal} देता है। स्रोत पर कटे {tax} टैक्स के बाद, आपके पास सालाना {result} रहता है।",
    },
    monthly: {
      title: "ज़रूरी मासिक बचत",
      body: "वह रकम जो {monthlyRate} की मासिक दर पर {months} महीनों में भविष्य की कीमत तक बढ़ती है: {fv} × {monthlyRate} ÷ ((1 + {monthlyRate})^{months} − 1) = {result}।",
    },
    real: {
      title: "वास्तविक रिटर्न",
      body: "हर साल आपके पैसे की खरीदने की ताकत कितनी बढ़ती है: (1 + {afterTax}) ÷ (1 + {inflation}) − 1 = {result}। शून्य से नीचे का मतलब है कि ब्याज मिलने के बावजूद यह साधन महँगाई से हार रहा है।",
    },
  },

  plan: {
    total: {
      title: "आपकी मासिक रकम",
      body: "आपके बजट से पहले-बचत वाली रकम: {savings} = {result}। नीचे का हर हिस्सा इसी एक संख्या से निकाला जाता है।",
    },
    emergencyShare: {
      title: "आपातकालीन फ़ंड का हिस्सा",
      body: "फ़ंड पूरा होने तक, आपातकालीन फ़ंड उतना लेता है जितना उसका कैलकुलेटर कहता है, हर महीने {m1Monthly}, पर आपकी मासिक रकम ({total}) के {minShare} और {maxShare} के बीच रखा जाता है, ताकि बाकी हिस्सों को भी कुछ मिले। यह कभी अभी बचाने बाकी {gap} से ज़्यादा नहीं लेता: {result}।",
    },
    debtShare: {
      title: "ऊँचे ब्याज वाले कर्ज़ का हिस्सा",
      body: "आपातकालीन फ़ंड के बाद जो बचता है, वह ऊँचे ब्याज की सीमा से ऊपर वाले कर्ज़ में जाता है, चुकाने की ज़रूरत तक (ऊँचे ब्याज वाले सभी बकाये ÷ लक्ष्य के महीने): min({remaining}, {headroom}) = {result}।",
    },
    goalsShare: {
      title: "लक्ष्यों का हिस्सा",
      body: "जो कुछ बचता है, वह आपके लक्ष्यों में जाता है: min({remaining}, {goalsNeed}) = {result}। अगर यह लक्ष्यों की ज़रूरत से कम है, तो प्लान कमी दिखाता है।",
    },
    goalAllocation: {
      title: "इस लक्ष्य का हिस्सा",
      body: "इस लक्ष्य को हर महीने {need} चाहिए और आपके सभी लक्ष्यों को मिलाकर {goalsNeed}। ऊपर के हिस्सों के बाद बचे {remaining} को इसी अनुपात में बाँटा जाता है: {remaining} × {need} ÷ {goalsNeed} = {result}।",
    },
  },
};
