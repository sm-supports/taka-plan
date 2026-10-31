import type { Dictionary } from "../../types";

/** Country and language steps on "/" (imported there directly; see en/onboarding.ts). */
export const onboardingEntry: Pick<Dictionary["onboarding"], "country" | "language" | "switchCountry"> = {
  country: {
    title: "Unaishi nchi gani?",
    subtitle: "Tunatumia sarafu, viwango na bidhaa za akiba za nchi yako.",
    searchLabel: "Tafuta nchi yako",
    searchPlaceholder: "Jina la nchi, kwa Kiingereza au lugha yako",
    suggested: "Zinazopendekezwa",
    all: "Nchi zote",
    results: "Nchi zinazolingana",
    noMatch: "Hakuna nchi inayolingana na “{query}”.",
    currency: "Sarafu: {code}",
    current: "Chaguo la sasa",
    changeLater: "Unaweza kubadilisha nchi na lugha wakati wowote.",
    intro: "Maswali matano mafupi, kisha mpango wako wa akiba wa kila mwezi. Hakuna akaunti inayohitajika.",
    disclaimer: "Makadirio kwa ajili ya kujifunza tu; si ushauri wa kifedha, wa kodi wala wa kisheria.",
    region: {
      south_asia: "Asia Kusini",
      east_asia_pacific: "Asia Mashariki na Pasifiki",
      europe_central_asia: "Ulaya na Asia ya Kati",
      latin_america_caribbean: "Amerika ya Kusini na Karibiani",
      middle_east_north_africa: "Mashariki ya Kati na Afrika Kaskazini",
      north_america: "Amerika Kaskazini",
      sub_saharan_africa: "Afrika Kusini mwa Sahara",
    },
  },
  language: {
    title: "Ungependa lugha gani?",
    subtitle: "Unaweza kubadilisha wakati wowote kutoka kwenye menyu iliyo juu.",
    country: "Nchi: {country}",
    notAvailable: "Lugha yako bado haipatikani; Kiingereza kinatumika.",
    changeCountry: "Badilisha nchi",
  },
  /** "/" when the user picks another country while answers exist: the amounts are in the old currency. */
  switchCountry: {
    title: "Uanze upya kwa {country}?",
    body: "Majibu yako yameandikwa kwa {currency}. Ukianza upya kwa {country}, majibu yako ya sasa yatahifadhiwa kama rasimu, ili uweze kuyafungua tena wakati wowote.",
    capWarning: "Tayari una rasimu {max}, kwa hiyo ile ya zamani zaidi isiyo na jina itaondolewa.",
    confirm: "Anza upya",
    cancel: "Bakiza majibu yangu",
    saved: "Imehifadhiwa kama rasimu",
  },
};

/** Five quick questions, one per screen. */
export const onboarding: Dictionary["onboarding"] = {
  country: onboardingEntry.country,
  language: onboardingEntry.language,
  switchCountry: onboardingEntry.switchCountry,

  languagePick: {
    title: "Ungependa lugha gani?",
    subtitle: "Unaweza kubadilisha wakati wowote.",
  },

  progress: "Swali {n} kati ya 5",
  intro: "Maswali matano mafupi, kisha mpango wako. Hakuna akaunti inayohitajika.",

  step: {
    1: {
      title: "Una umri gani?",
      hint: "Umri wako unaamua muda ambao malengo yako na akiba ya kustaafu vinapata kukua.",
      placeholder: "Umri wako kwa miaka",
      label: "Umri wako",
      decadeLabel: "Gusa kifupisho, kisha rekebisha umri kamili hapa chini",
      decade: {
        under20: "Chini ya 20",
        twenties: "Miaka ya 20",
        thirties: "Miaka ya 30",
        forties: "Miaka ya 40",
        fifties: "Miaka ya 50",
        sixtyPlus: "60 na zaidi",
      },
      unit: "miaka",
    },
    2: {
      title: "Kipato chako halisi cha mwezi ni kiasi gani?",
      hint: "Kiasi kinachoingia kwenye akaunti yako baada ya kodi na mfuko wa akiba ya wafanyakazi.",
      hintFreelance: "Kipato kisicho cha kawaida? Jumlisha miezi sita iliyopita kisha gawanya kwa sita.",
      placeholder: "Kipato halisi kwa sarafu yako",
      label: "Kipato halisi cha mwezi",
      incomeTypeLabel: "Unapataje kipato?",
      incomeTypeHint: {
        salaried: "Mshahara usiobadilika kila mwezi",
        freelance: "Malipo ya miradi au wateja yanayobadilika",
        business: "Faida unayochukua kutoka biashara yako",
      },
      average: {
        toggle: "Kokotoa kutoka miezi sita iliyopita",
        title: "Kipato cha miezi sita iliyopita",
        hint: "Andika ulichopokea kila mwezi. Acha mwezi tupu kama hukupata chochote.",
        month: "Mwezi {n}",
        result: "Wastani wa miezi sita: {amount}",
        use: "Tumia {amount} kama kipato changu halisi",
        close: "Ficha",
      },
    },
    3: {
      title: "Unatumia kiasi gani kwa mahitaji muhimu kila mwezi?",
      hint: "Kodi ya nyumba, chakula, huduma, usafiri, ada za shule, msaada kwa wazazi na EMI zozote unazolipa tayari. Acha nje kula hotelini, manunuzi na likizo.",
      placeholder: "Matumizi muhimu kwa sarafu yako",
      label: "Matumizi muhimu ya mwezi",
      countsTitle: "Kinachohesabiwa kama muhimu",
      counts: {
        rent: "Kodi ya nyumba au EMI ya mkopo wa nyumba",
        food: "Chakula na mahitaji ya nyumbani",
        utilities: "Umeme, gesi, maji, simu na intaneti",
        transport: "Usafiri",
        school: "Ada za shule na masomo",
        parents: "Msaada unaowatumia wazazi",
        emi: "EMI yoyote ya mkopo au kadi unayolipa tayari",
      },
      leaveOut: "Acha nje kula hotelini, manunuzi, vifaa vya kielektroniki na likizo.",
      takeHomeReminder: "Kipato chako halisi: {amount}",
      leftOver: "Kinachobaki baada ya mahitaji muhimu: {amount}",
    },
    4: {
      title: "Nani anategemea kipato chako?",
      hint: "Chagua wote wanaohusika. Wanaokutegemea hubadilisha akiba yako ya dharura na mahitaji ya bima.",
      none: "Hakuna anayenitegemea",
      label: "Wanaokutegemea",
      option: {
        partner: "Mwenzi",
        children: "Watoto",
        parents: "Wazazi",
      },
      optionHint: {
        partner: "Mume au mke anayetegemea kipato chako",
        children: "Mtoto yeyote unayemlea",
        parents: "Wazazi au wakwe unaowasaidia",
      },
    },
    5: {
      title: "Una mikopo yoyote au salio la kadi ya mkopo ambalo hulipi lote?",
      hint: "Hesabu mikopo ya benki, mikopo ya gari au nyumba, na bili yoyote ya kadi usiyolipa yote kila mwezi.",
      yes: "Ndiyo, nina deni",
      no: "Sina deni",
      label: "Mikopo au salio la kadi",
      yesNote: "Vizuri kujua. Mpango wako utajumuisha ukaguzi wa madeni ili deni la gharama kubwa zaidi lilipwe kwanza.",
      noNote: "Vizuri sana. Mpango wako unaweza kwenda moja kwa moja kwenye akiba.",
      readyTitle: "Hayo ndiyo yote",
      ready: "Mpango wako umejengwa kutokana na majibu haya matano. Unaweza kubadilisha lolote baadaye.",
    },
  },

  summary: {
    age: "Umri {age}",
    takeHome: "Kipato halisi {amount}",
    essentials: "Mahitaji muhimu {amount}",
    /** {list}: the people who depend on the user, already joined ("Partner, Children"). */
    dependents: "Wanaokutegemea: {list}",
    noDependents: "Hakuna anayekutegemea",
    debt: "Una mikopo au deni la kadi",
    noDebt: "Huna deni",
  },

  cta: {
    start: "Anza",
    seePlan: "Ona mpango wangu",
    next: "Endelea",
    back: "Rudi",
  },

  validation: {
    required: "Tafadhali weka namba ili kuendelea.",
    number: "Weka tarakimu tu, kama {example}.",
    ageRange: "Weka umri kati ya {min} na {max}.",
    positiveAmount: "Weka kiasi kilicho juu ya sifuri.",
    essentialsAboveIncome: "Mahitaji muhimu ni zaidi ya kipato chako halisi. Kagua namba zote mbili — mpango bado unaweza kufanya kazi, lakini kiasi cha akiba kitakuwa kidogo sana.",
    pickOne: "Chagua angalau chaguo moja, au “Hakuna”.",
  },
};
