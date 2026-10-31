import type { Dictionary } from "../../types";

/** Plan screen. Reason params are documented in ../en/plan.ts. */
export const plan: Dictionary["plan"] = {
  title: "Mpango wako",
  headline: "Weka akiba {amount} kwa mwezi",
  subhead: "Imegawanywa katika mafungu yako kwa mpangilio wa kipaumbele. Gusa kadi kuirekebisha; mpango unasasishwa papo hapo.",
  emptyGoals: "Bado hakuna malengo. Ongeza moja — kustaafu nako ni lengo — na mpango utalipatia nafasi.",
  builtOn: "Umejengwa kwa viwango v{version}",
  demoBanner: "Mpango wa mfano uliojengwa kwa namba za majaribio, si zako. Fungua mpango bila swichi ya majaribio kuona mpango wako.",

  why: {
    headline: "Kwa nini uweke akiba {amount} kwa mwezi?",
    bucket: "Kwa nini {amount} kwa {bucket}?",
  },

  error: {
    title: "Mpango wako bado haujawa tayari",
    retry: "Jaribu tena",
  },

  card: {
    amount: "Kiasi",
    instrument: "Wapi",
    reason: "Kwa nini",
    nextStep: "Hatua inayofuata",
    open: "Fungua kikokotoo",
    priority: "Kipaumbele {n}",
    perMonth: "{amount}/mwezi",
    goalTitle: "Lengo: {name}",
    bucket: {
      emergency: "Akiba ya dharura",
      insurance: "Bima",
      debt: "Kulipa madeni",
      goal: "Lengo",
      retirement: "Kustaafu",
      future: "Baadaye",
    },
  },

  more: {
    title: "Kamilisha mpango wako",
    start: "Anza",
    edit: "Hariri",
    reserved: "Mpango unatenga {amount} kwa mwezi kwa ajili ya hili.",
    m2: { title: "Bima na afya", body: "Kinga ya maisha na afya ambayo familia yako inahitaji, na takriban gharama yake." },
    m6: { title: "Mchanganyiko wa mali", body: "Jinsi ya kugawa pesa ya muda mrefu kati ya mapato ya kudumu, hisa na dhahabu kulingana na umri wako." },
    m7: { title: "Kustaafu na familia", body: "Unachohitaji kuishi kwa pesa yako mwenyewe hadi miaka 100, na vyanzo vipi vya kipato vinapunguza kiasi hicho." },
  },

  summary: {
    title: "Muhtasari",
    emergencyShare: "{share} ya kiasi chako cha kila mwezi inaenda kwenye akiba ya dharura hadi ijae.",
    monthsToFull: "Akiba ya dharura itajaa baada ya {months}.",
    emergencyFull: "Akiba yako ya dharura imejaa.",
    goalsShortfall: "Malengo yako yanahitaji {amount} zaidi kwa mwezi kuliko mpango unavyoweza kubeba sasa.",
    noShortfall: "Kila lengo linatosha ndani ya kiasi cha mwezi huu.",
    retirementShortfall: "Kustaafu kunahitaji {amount} zaidi kwa mwezi kuliko mpango unavyoweza kubeba sasa.",
  },

  reason: {
    emergency: "Akiba ya dharura — {amount}/mwezi kwenye {instrument} — miezi {covered} kati ya {months} imelindwa",
    emergencyFull: "Akiba ya dharura — imejaa kwa miezi {months} ya mahitaji muhimu — ijaze tena kila unapoitumia",
    debt: "Deni lenye riba kubwa ya {rate} — {amount}/mwezi juu ya EMI yako — litaisha baada ya takriban {months} kwa kasi hii",
    debtNever: "Deni lenye riba kubwa ya {rate} — {amount}/mwezi juu ya EMI yako — kwa kasi hii haliishi kamwe, kwa hiyo lipa zaidi au lihamishie kwenye mkopo wenye riba nafuu",
    debtNone: "Deni lenye riba kubwa ya {rate} — hakuna nafasi mwezi huu bado — lipa angalau kiwango cha chini kwa kila deni",
    goal: "{name} — {amount}/mwezi kwenye {instrument} — utahitaji {fv} baada ya {years}",
    addGoal: "Ongeza lengo — kila mpango unahitaji angalau moja, na kustaafu nako ni lengo",
    insurance: "Bima — {amount}/mwezi zimetengwa kwa bima ya maisha ya muda na ya afya",
    insuranceNone: "Bima — hakuna nafasi mwezi huu bado — kinga bado ni muhimu, kwa hiyo fungua ukaguzi wa bima",
    retirement: "Kustaafu — {amount}/mwezi ili pesa yako idumu hadi umri wa miaka {planTo}",
    retirementShort: "Kustaafu — {amount}/mwezi kati ya {need} unazohitaji — inadumu hadi umri wa miaka {lastsTo}",
    retirementShortNoAge: "Kustaafu — {amount}/mwezi kati ya {need} unazohitaji",
    retirementNone: "Kustaafu — hakuna nafasi mwezi huu bado kwa {need} kwa mwezi unazohitaji",
    future: "Akiba ya muda mrefu — {amount}/mwezi kwenye {instrument} hadi utakapoongeza lengo",
  },

  next: {
    fdrLadder: "Tembelea benki yoyote ukiwa na kitambulisho cha taifa na namba ya mlipakodi; omba {product} ya miezi 3. Fungua moja kila mwezi kwa miezi mitatu ili moja ikomae kila mwezi.",
    openSavings: "Fungua {product} kwenye benki yoyote kwa kitambulisho chako cha taifa. Weka humo gharama ya mwezi mmoja ya mahitaji muhimu, na kinachobaki kiweke kwenye amana za miezi 3.",
    prepayDebt: "Mpigie mkopeshaji wako simu na uulize jinsi ya kulipa ziada kwenye deni la msingi bila adhabu. Anza na deni lenye riba kubwa zaidi.",
    dps: "Omba benki yako ikufungulie {product} yenye makato ya kiotomatiki siku moja baada ya mshahara kuingia. Kiasi chochote kinafaa; tabia ni muhimu kuliko ukubwa.",
    sanchayapatra: "Peleka kitambulisho chako cha taifa, namba ya mlipakodi na hundi ya akaunti yako ya benki kwenye tawi la benki au posta inayouza hati za akiba za serikali, na uombe {product}.",
    tbond: "Omba benki yako ikusajili kwa minada ya hatifungani za serikali na uombe {product} ya miaka 5 au 10; unaweza pia kununua iliyokwisha kutolewa kupitia akaunti ya udalali.",
    fdr: "Tembelea benki yoyote ukiwa na kitambulisho cha taifa na namba ya mlipakodi; omba {product} ya mwaka 1 na uhifadhi risiti mahali salama.",
    addGoal: "Gusa “Ongeza lengo”, lipe jina, weka gharama yake kwa pesa ya leo, na idadi ya miaka iliyobaki.",
    keepFull: "Akiba yako imejaa: iache ilipo. Baada ya kutoa pesa yoyote, rudisha kiasi hichohicho kabla ya akiba nyingine yoyote, ili ijae tena.",
    insurance: "Fungua ukaguzi wa bima: unakokotoa kinga ya maisha na afya ambayo familia yako inahitaji na takriban gharama yake.",
    retirement: "Fungua mpango wa kustaafu: ona unachohitaji kuishi kwa pesa yako mwenyewe hadi miaka 100, na vyanzo vipi vya kipato vinapunguza kiasi hicho.",
    allocation: "Fungua mchanganyiko wa mali: unagawa pesa ya muda mrefu kati ya mapato ya kudumu, hisa na dhahabu kulingana na umri wako.",
  },

  note: {
    insuranceSkipped: "Majibu yako ya bima hayakuweza kukokotolewa kwa wasifu wako wa sasa, kwa hiyo bima imeachwa nje ya mpango huu kwa sasa. Fungua ukaguzi wa bima kuyasasisha.",
    allocationSkipped: "Majibu yako ya mchanganyiko wa mali hayakuweza kukokotolewa kwa wasifu wako wa sasa, kwa hiyo mpango unatumia mapato ya kudumu kwa sasa. Fungua mchanganyiko wa mali kuyasasisha.",
    retirementSkipped: "Majibu yako ya kustaafu hayalingani tena na wasifu wako (kwa mfano, umri wako umebadilika), kwa hiyo kustaafu kumeachwa nje ya mpango huu kwa sasa. Fungua mpango wa kustaafu kuyasasisha.",
  },
};
