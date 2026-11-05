import type { Dictionary } from "../../types";

/** /{locale}/about. Every rates number is a {placeholder}; see ../en/about.ts. */
export const about: Dictionary["about"] = {
  title: "Kuhusu Taka Plan",
  lead: "Kikokotoo cha bure kinachomweleza mpokeaji kipato wa Bangladesh kiasi kinachohitajika kwa kila lengo na mahali pa kuweka pesa kila mwezi. Kinafundisha na kukokotoa; wewe unachukua hatua kupitia benki yako, akaunti yako ya BO au kampuni yako ya bima.",
  disclaimer: { heading: "Tahadhari" },
  method: {
    heading: "Jinsi mpango unavyojengwa",
    intro: "Mpango unafuata hatua saba kwa mpangilio maalum: linda kwanza, kisha weka akiba, kisha kuza. Kila hatua ni kikokotoo kidogo kimoja, na kwa pamoja vinatoa kiasi kimoja cha kila mwezi.",
    phase: { protect: "Linda", save: "Weka akiba", grow: "Kuza" },
    order:
      "Kiasi chako cha kila mwezi kinagawanywa kwa mpangilio wa kipaumbele: akiba ya dharura kwanza, kisha ada za bima, kisha deni lolote la gharama kubwa, na baada ya hapo tu malengo na kustaafu. Hadi akiba ya dharura ijae, angalau {share} ya kiasi cha kila mwezi inaenda huko, ili kinachobaki kianzishe tabia yako ya kuwekeza leo.",
    returnsHeading: "Faida baada ya kodi na baada ya mfumuko wa bei",
    returns:
      "Kila faida inaonyeshwa ikiwa imepunguzwa mara mbili: kwanza baada ya kodi ya zuio, kisha baada ya mfumuko wa bei. Swali si kiwango kilichotangazwa; ni kile unachobaki nacho, na kile kitakachoweza bado kununua. Bidhaa inaweza kulipa riba na bado ikashindwa na mfumuko wa bei, na programu inasema hivyo kwa rangi nyekundu inapotokea.",
    exampleCaption: "Kwa jedwali la viwango la leo:",
    rounding: "Matokeo yanazungushwa hadi namba ya karibu iliyo rahisi, kwa sababu makadirio ya miaka ishirini hayawezi kuwa sahihi hadi senti ya mwisho. Viwango (chini, kinachotarajiwa, juu) vinaonyeshwa pale ambapo faida ya baadaye haina uhakika.",
    onDevice: "Hesabu zote zinafanyika kwenye simu yako, na majibu yako yanabaki humo. Seva inahifadhi tu jedwali la viwango na data za kila nchi.",
  },
  sources: {
    heading: "Vyanzo na makisio",
    intro: "Kila safu hapa chini ni makisio moja yanayosomwa na vikokotoo. Toleo la viwango {version}, lilichapishwa {date}. Safu zenye alama “makisio yetu” ni chaguo-msingi tulizochagua na zinaweza kubadilika; zilizobaki zimenakiliwa kutoka chanzo kilichochapishwa kilichounganishwa kando ya kila moja.",
    group: {
      macro: "Mfumuko wa bei na riba ya benki kuu",
      bank: "Amana za benki",
      sanchayapatra: "Sanchayapatra",
      govt: "Dhamana za serikali",
      market: "Hisa na dhahabu",
      risk: "Mikopo, bima na muda wa kuishi",
      tax: "Sheria za kodi (mwaka wa fedha 2026-27)",
      policy: "Chaguo-msingi za programu",
      other: "Nyingine",
    },
    value: "Thamani",
    dates: "Tarehe",
    nextReview: "Ukaguzi ujao",
    note: "Maelezo",
    slabNext: "{rate} kwa {width} inayofuata",
    slabRest: "{rate} kwa kiasi kilichobaki",
    unverifiedHeading: "Bado hazijathibitishwa",
    unverifiedIntro: "Hatujaweza kuthibitisha hizi, kwa hiyo hakuna kikokotoo kinachozitegemea bado:",
    unverified: [
      "Ada za sasa za bima ya maisha ya muda kwa kinga ya laki 10 (milioni 1) na crore 1 (milioni 10).",
      "Viwango vya juu vya uwekezaji wa Sanchayapatra kwa mwaka 2026.",
      "Kama kodi iliyopunguzwa kwa wawekezaji wadogo wa Sanchayapatra ilibaki kwenye Sheria ya Fedha.",
      "Uwiano wa EMI kwa kipato wa Bangladesh Bank (inaonekana haupo; tunatumia kiwango chetu wenyewe).",
      "Viwango vya riba vya soko zima kwa mikopo binafsi na ya nyumba.",
    ],
  },
};
