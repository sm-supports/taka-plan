import type { Dictionary } from "../../types";

export const explainM2: Dictionary["explain"]["m2"] = {
  years: {
    title: "कितने साल का कवर",
    body: "जीवन बीमा आपकी आज की उम्र, {ageYears}, से {coverToAgeYears} की उम्र तक चलता है, जब परिवार आमतौर पर आपकी आय पर निर्भर नहीं रहता, या तब तक जब आपका सबसे छोटा बच्चा {childIndependentAgeYears} का हो जाए, अगर आपने बच्चे की उम्र दी है और वह पहले आता है: {result} साल। यह कभी शून्य से नीचे नहीं जाता।",
  },
  incomeNeed: {
    title: "आय की भरपाई",
    body: "परिवार को आपके {takeHome} मासिक टेक-होम का {incomeShare} चाहिए होगा: सालाना {yearlyNeed}। यह ज़रूरत {coveredYears} साल तक {inflation} सालाना की दर से कीमतों के साथ बढ़ती है। आज सुरक्षित बचत में रखा पैसा टैक्स के बाद {afterTax} कमा सकता है, जो कीमतों के बढ़ने से सालाना {realRate} ज़्यादा है, इसलिए आज की वह एकमुश्त रकम जो अभी से हर साल की ज़रूरत पूरी करे, {result} है।",
  },
  lifeCover: {
    title: "ज़रूरी जीवन बीमा",
    body: "भरपाई के लिए आय {incomeNeed}, साथ में कर्ज़ {debts} और पढ़ाई के लक्ष्य {educationGoals}, घटाकर परिवार की पहुँच वाली बचत {liquidSavings} और निवेश {investments}: {result}। यह कभी शून्य से नीचे नहीं जाता।",
  },
  lifeGap: {
    title: "अभी खरीदना बाकी जीवन बीमा",
    body: "ज़रूरी कवर में से आपके पास पहले से मौजूद कवर घटाकर: {cover} − {existingLifeCover} = {result}।",
  },
  perStay: {
    title: "हर वयस्क के लिए स्वास्थ्य बीमा",
    body: "अस्पताल में एक आम भर्ती का खर्च लगभग {hospitalCost} है। परिवार स्वास्थ्य खर्च का {oopShare} खुद चुकाते हैं; हम कम से कम {publicFloorShare} लेते हैं, इसलिए {appliedShare} मानते हैं: हर वयस्क के लिए {result} का कवर।",
  },
  healthTarget: {
    title: "परिवार के लिए स्वास्थ्य बीमा",
    body: "हर वयस्क का कवर {perStay} गुणा कवर किए गए {peopleCount} लोगों का भार, कुल {weightCount} (बच्चे का भार वयस्क से कम, माता-पिता का ज़्यादा): {result}।",
  },
  healthGap: {
    title: "अभी खरीदना बाकी स्वास्थ्य बीमा",
    body: "परिवार के लक्ष्य में से आपके पास पहले से मौजूद स्वास्थ्य बीमा घटाकर: {target} − {existingHealthCover} = {result}।",
  },
  lifePremium: {
    title: "टर्म जीवन बीमा का सालाना प्रीमियम",
    body: "आपकी उम्र में टर्म जीवन बीमा हर {per} के कवर पर सालाना लगभग {bandLow} से {bandHigh} पड़ता है, धूम्रपान करने पर {smokerMultipleCount} गुना। {gap} के कवर के लिए यह सालाना {premiumLow} से {premiumHigh} है; बीच का आँकड़ा {result} है।",
  },
  healthPremium: {
    title: "स्वास्थ्य बीमा का सालाना प्रीमियम",
    body: "स्वास्थ्य बीमा की कीमत हर {per} के कवर पर, हर व्यक्ति की उम्र के हिसाब से तय होती है। {peopleCount} लोगों के लिए {gap} के अतिरिक्त कवर पर यह सालाना {premiumLow} से {premiumHigh} है; बीच का आँकड़ा {result} है।",
  },
  monthlyNeed: {
    title: "हर महीने अलग रखें",
    body: "दोनों सालाना दायरों का बीच का आँकड़ा, टर्म जीवन बीमा {lifePremium} और स्वास्थ्य बीमा {healthPremium}, {months} महीनों में बाँटकर: हर महीने {result}।",
  },
  policyTerm: {
    title: "उतनी ही रकम का टर्म कवर",
    body: "पॉलिसी के कवर {sumAssured} के लिए टर्म जीवन बीमा आपकी उम्र में हर {per} पर सालाना लगभग {bandLow} से {bandHigh} पड़ता है, धूम्रपान करने पर {smokerMultipleCount} गुना। बीच का आँकड़ा सालाना {result} है।",
  },
  policyInvest: {
    title: "बचे पैसे की बचत",
    body: "अगर आप अभी बंद करें, तो बीमा कंपनी जो लौटाती है, {surrenderValue}, वह टैक्स के बाद {afterTax} कमाने वाली सुरक्षित जमा में बढ़कर {surrenderValueFV} हो जाता है। आपके प्रीमियम {annualPremium} में से टर्म प्रीमियम {termPremium} घटाकर सालाना {yearlyDifference} बचता है; बचे {remainingYears} सालों में हर साल की शुरुआत में उसी जमा में डालें, तो सब मिलाकर {result} होता है।",
  },
  policyIrr: {
    title: "पॉलिसी का सालाना रिटर्न",
    body: "पॉलिसी जारी रखने का मतलब है आज {surrenderValue} छोड़ना और {termYears} में से बचे {remainingYears} सालों तक सालाना {annualPremium} चुकाना, ताकि अंत में {expectedMaturity} मिले: यानी उस पैसे पर सालाना {result} कमाने जैसा। इसकी जगह बंद करके बचे पैसे की बचत करें तो {investValue} तक पहुँचते, यानी {difference} का अंतर।",
  },
};
