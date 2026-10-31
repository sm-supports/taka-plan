import type { Dictionary } from "../../types";

/** Country and language steps on "/" (imported there directly; see en/onboarding.ts). */
export const onboardingEntry: Pick<Dictionary["onboarding"], "country" | "language" | "switchCountry"> = {
  country: {
    title: "आप कहाँ रहते हैं?",
    subtitle: "हम आपके देश की मुद्रा, दरें और बचत के साधन इस्तेमाल करते हैं।",
    searchLabel: "अपना देश खोजें",
    searchPlaceholder: "देश का नाम, अंग्रेज़ी में या अपनी भाषा में",
    suggested: "सुझाए गए",
    all: "सभी देश",
    results: "मिलते-जुलते देश",
    noMatch: "“{query}” से कोई देश नहीं मिला।",
    currency: "मुद्रा: {code}",
    current: "अभी का चुनाव",
    changeLater: "आप अपना देश और भाषा कभी भी बदल सकते हैं।",
    intro: "पाँच छोटे सवाल, फिर आपका मासिक बचत प्लान। कोई खाता नहीं चाहिए।",
    disclaimer: "केवल सीखने के लिए अनुमान; यह वित्तीय, टैक्स या कानूनी सलाह नहीं है।",
    region: {
      south_asia: "दक्षिण एशिया",
      east_asia_pacific: "पूर्वी एशिया और प्रशांत",
      europe_central_asia: "यूरोप और मध्य एशिया",
      latin_america_caribbean: "लैटिन अमेरिका और कैरिबियन",
      middle_east_north_africa: "मध्य पूर्व और उत्तरी अफ़्रीका",
      north_america: "उत्तरी अमेरिका",
      sub_saharan_africa: "उप-सहारा अफ़्रीका",
    },
  },
  language: {
    title: "आप कौन सी भाषा चाहेंगे?",
    subtitle: "आप ऊपर के मेन्यू से कभी भी बदल सकते हैं।",
    country: "देश: {country}",
    notAvailable: "आपकी भाषा अभी उपलब्ध नहीं है; अंग्रेज़ी इस्तेमाल हो रही है।",
    changeCountry: "देश बदलें",
  },
  switchCountry: {
    title: "{country} के लिए नए सिरे से शुरू करें?",
    body: "आपके जवाब {currency} में हैं। {country} के लिए नए सिरे से शुरू करने पर आपके अभी के जवाब ड्राफ़्ट के रूप में रखे जाते हैं, ताकि आप उन्हें कभी भी फिर खोल सकें।",
    capWarning: "आपके पास पहले से {max} ड्राफ़्ट हैं, इसलिए बिना नाम वाला सबसे पुराना ड्राफ़्ट हटा दिया जाएगा।",
    confirm: "नए सिरे से शुरू करें",
    cancel: "मेरे जवाब रखें",
    saved: "ड्राफ़्ट के रूप में सेव हुआ",
  },
};

/** Five quick questions, one per screen. */
export const onboarding: Dictionary["onboarding"] = {
  country: onboardingEntry.country,
  language: onboardingEntry.language,
  switchCountry: onboardingEntry.switchCountry,

  languagePick: {
    title: "आप कौन सी भाषा चाहेंगे?",
    subtitle: "आप कभी भी बदल सकते हैं।",
  },

  progress: "सवाल {n} / 5",
  intro: "पाँच छोटे सवाल, फिर आपका प्लान। कोई खाता नहीं चाहिए।",

  step: {
    1: {
      title: "आपकी उम्र क्या है?",
      hint: "आपकी उम्र तय करती है कि आपके लक्ष्यों और रिटायरमेंट को बढ़ने के लिए कितना समय है।",
      placeholder: "आपकी उम्र, सालों में",
      label: "आपकी उम्र",
      decadeLabel: "कोई शॉर्टकट चुनें, फिर नीचे सही उम्र ठीक करें",
      decade: {
        under20: "20 से कम",
        twenties: "20–29",
        thirties: "30–39",
        forties: "40–49",
        fifties: "50–59",
        sixtyPlus: "60 या ज़्यादा",
      },
      unit: "साल",
    },
    2: {
      title: "आपका मासिक टेक-होम कितना है?",
      hint: "टैक्स और भविष्य निधि कटने के बाद असल में आपके खाते में आने वाली रकम।",
      hintFreelance: "आय अनियमित है? पिछले छह महीनों की आय जोड़कर छह से भाग दें।",
      placeholder: "आपकी मुद्रा में टेक-होम",
      label: "मासिक टेक-होम",
      incomeTypeLabel: "आप कैसे कमाते हैं?",
      incomeTypeHint: {
        salaried: "हर महीने तय तनख्वाह",
        freelance: "प्रोजेक्ट या क्लाइंट से बदलते भुगतान",
        business: "अपने व्यवसाय से निकाला गया मुनाफ़ा",
      },
      average: {
        toggle: "पिछले छह महीनों से हिसाब लगाएँ",
        title: "पिछले छह महीनों की आय",
        hint: "हर महीने जो मिला, वह लिखें। किसी महीने कुछ न मिला हो तो खाली छोड़ें।",
        month: "महीना {n}",
        result: "छह महीने का औसत: {amount}",
        use: "{amount} को मेरा टेक-होम मानें",
        close: "छिपाएँ",
      },
    },
    3: {
      title: "हर महीने ज़रूरी चीज़ों पर कितना खर्च करते हैं?",
      hint: "किराया, खाना, बिजली-पानी, आना-जाना, स्कूल फ़ीस, माता-पिता को मदद और पहले से चल रही EMI। बाहर खाना, शॉपिंग और छुट्टियाँ शामिल न करें।",
      placeholder: "आपकी मुद्रा में ज़रूरी खर्च",
      label: "मासिक ज़रूरी खर्च",
      countsTitle: "ज़रूरी खर्च में क्या गिना जाता है",
      counts: {
        rent: "किराया या होम लोन की EMI",
        food: "खाना और राशन",
        utilities: "बिजली, गैस, पानी, फ़ोन और इंटरनेट",
        transport: "आना-जाना",
        school: "स्कूल और ट्यूशन फ़ीस",
        parents: "माता-पिता को भेजी जाने वाली मदद",
        emi: "पहले से चल रही कोई भी लोन या कार्ड EMI",
      },
      leaveOut: "बाहर खाना, शॉपिंग, गैजेट और छुट्टियाँ शामिल न करें।",
      takeHomeReminder: "आपका टेक-होम: {amount}",
      leftOver: "ज़रूरी खर्च के बाद बचा: {amount}",
    },
    4: {
      title: "आपकी आय पर कौन निर्भर है?",
      hint: "जो भी लागू हों, सब चुनें। आश्रितों से आपका आपातकालीन फ़ंड और बीमा की ज़रूरत बदलती है।",
      none: "मुझ पर कोई निर्भर नहीं",
      label: "आश्रित",
      option: {
        partner: "जीवनसाथी",
        children: "बच्चे",
        parents: "माता-पिता",
      },
      optionHint: {
        partner: "आपकी आय पर निर्भर पति या पत्नी",
        children: "कोई भी बच्चा जिसकी आप मदद करते हैं",
        parents: "माता-पिता या सास-ससुर जिनकी आप मदद करते हैं",
      },
    },
    5: {
      title: "क्या आप पर कोई लोन या क्रेडिट कार्ड का बकाया है?",
      hint: "बैंक लोन, कार या होम लोन, और हर वह कार्ड बिल गिनें जो आप हर महीने पूरा नहीं चुकाते।",
      yes: "हाँ, मुझ पर कर्ज़ है",
      no: "कोई कर्ज़ नहीं",
      label: "लोन या कार्ड का बकाया",
      yesNote: "जानकर अच्छा लगा। आपके प्लान में कर्ज़ की जाँच होगी, ताकि सबसे महँगा कर्ज़ पहले चुके।",
      noNote: "बढ़िया। आपका प्लान सीधे बचत पर जा सकता है।",
      readyTitle: "बस इतना ही",
      ready: "आपका प्लान इन पाँच जवाबों से बनता है। आप इनमें से कोई भी बाद में बदल सकते हैं।",
    },
  },

  summary: {
    age: "उम्र {age}",
    takeHome: "टेक-होम {amount}",
    essentials: "ज़रूरी खर्च {amount}",
    /** {list}: the people who depend on the user, already joined. */
    dependents: "आप पर निर्भर: {list}",
    noDependents: "आप पर कोई निर्भर नहीं",
    debt: "लोन या कार्ड का कर्ज़ है",
    noDebt: "कोई कर्ज़ नहीं",
  },

  cta: {
    start: "शुरू करें",
    seePlan: "मेरा प्लान देखें",
    next: "आगे",
    back: "पीछे",
  },

  validation: {
    required: "आगे बढ़ने के लिए कोई संख्या भरें।",
    number: "केवल अंक भरें, जैसे {example}।",
    ageRange: "{min} और {max} के बीच की उम्र भरें।",
    positiveAmount: "शून्य से ज़्यादा रकम भरें।",
    essentialsAboveIncome: "ज़रूरी खर्च आपके टेक-होम से ज़्यादा है। दोनों संख्याएँ फिर से देख लें — प्लान फिर भी काम करेगा, पर बचत की रकम बहुत छोटी होगी।",
    pickOne: "कम से कम एक विकल्प चुनें, या “कोई नहीं”।",
  },
};
