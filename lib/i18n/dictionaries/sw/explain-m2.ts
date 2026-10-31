// "Why this number?" entries for M2 steps; placeholder names are documented in ../en/explain-m2.ts.
import type { Dictionary } from "../../types";

export const explainM2: Dictionary["explain"]["m2"] = {
  years: {
    title: "Miaka ya kinga",
    body: "Bima ya maisha inaanzia umri wako wa leo, {ageYears}, hadi umri wa {coverToAgeYears}, ambapo kwa kawaida familia haitegemei tena kipato chako, au hadi mtoto wako mdogo zaidi afikishe {childIndependentAgeYears} ikiwa ulitoa umri wa mtoto na hilo litatangulia: miaka {result}. Haishuki chini ya sifuri.",
  },
  incomeNeed: {
    title: "Kipato cha kufidia",
    body: "Familia ingehitaji {incomeShare} ya kipato chako halisi cha {takeHome} kwa mwezi: {yearlyNeed} kwa mwaka. Hitaji hilo linakua na bei kwa {inflation} kwa mwaka kwa miaka {coveredYears}. Pesa iliyowekwa leo kwenye akiba salama inaweza kupata {afterTax} baada ya kodi, ambayo ni {realRate} kwa mwaka zaidi ya kupanda kwa bei, kwa hiyo mkupuo wa leo unaolipia hitaji la kila mwaka, kuanzia sasa, ni {result}.",
  },
  lifeCover: {
    title: "Bima ya maisha inayohitajika",
    body: "Kipato cha kufidia {incomeNeed}, pamoja na madeni {debts} na malengo ya elimu {educationGoals}, ukitoa akiba ambayo familia inaweza kupata {liquidSavings} na uwekezaji {investments}: {result}. Haishuki chini ya sifuri.",
  },
  lifeGap: {
    title: "Bima ya maisha iliyobaki kununua",
    body: "Bima inayohitajika ukitoa bima uliyonayo tayari: {cover} − {existingLifeCover} = {result}.",
  },
  perStay: {
    title: "Bima ya afya kwa kila mtu mzima",
    body: "Kulazwa hospitali mara moja kwa kawaida kunagharimu takriban {hospitalCost}. Familia hulipa {oopShare} ya gharama za afya wenyewe; tunatumia angalau {publicFloorShare}, kwa hiyo tunachukua {appliedShare}: kinga ya {result} kwa kila mtu mzima.",
  },
  healthTarget: {
    title: "Bima ya afya ya familia",
    body: "Kinga kwa kila mtu mzima {perStay} mara uzito wa watu {peopleCount} wanaolindwa, {weightCount} kwa jumla (mtoto anahesabiwa chini ya mtu mzima, mzazi zaidi): {result}.",
  },
  healthGap: {
    title: "Bima ya afya iliyobaki kununua",
    body: "Lengo la familia ukitoa bima ya afya uliyonayo tayari: {target} − {existingHealthCover} = {result}.",
  },
  lifePremium: {
    title: "Ada ya mwaka ya bima ya maisha ya muda",
    body: "Bima ya maisha ya muda inagharimu takriban {bandLow} hadi {bandHigh} kwa mwaka kwa kila {per} ya kinga katika umri wako, mara {smokerMultipleCount} kwa uvutaji. Kwa kinga ya {gap} hiyo ni {premiumLow} hadi {premiumHigh} kwa mwaka; katikati ni {result}.",
  },
  healthPremium: {
    title: "Ada ya mwaka ya bima ya afya",
    body: "Bima ya afya inapangiwa bei kwa kila {per} ya kinga, kulingana na umri wa kila mtu. Kwa kinga ya ziada ya {gap} kwa watu {peopleCount} hiyo ni {premiumLow} hadi {premiumHigh} kwa mwaka; katikati ni {result}.",
  },
  monthlyNeed: {
    title: "Cha kutenga kila mwezi",
    body: "Katikati ya viwango viwili vya mwaka, bima ya maisha ya muda {lifePremium} pamoja na afya {healthPremium}, ikigawanywa kwa miezi {months}: {result} kwa mwezi.",
  },
  policyTerm: {
    title: "Bima ya muda ya kiasi hichohicho",
    body: "Bima ya maisha ya muda kwa kinga ya sera {sumAssured} inagharimu takriban {bandLow} hadi {bandHigh} kwa mwaka kwa kila {per} katika umri wako, mara {smokerMultipleCount} kwa uvutaji. Katikati ni {result} kwa mwaka.",
  },
  policyInvest: {
    title: "Kuweka akiba tofauti",
    body: "Ukisitisha sasa, kile kampuni ya bima inarudisha, {surrenderValue}, kinakua hadi {surrenderValueFV} kwenye amana salama inayopata {afterTax} baada ya kodi. Ada yako {annualPremium} ukitoa ada ya bima ya muda {termPremium} inabakiza {yearlyDifference} kwa mwaka; ukiiweka kwenye amana hiyohiyo mwanzoni mwa kila moja ya miaka {remainingYears} iliyobaki, kwa jumla inafikia {result}.",
  },
  policyIrr: {
    title: "Faida ya mwaka ya sera",
    body: "Kuendelea na sera kunamaanisha kuacha {surrenderValue} leo na kulipa {annualPremium} kwa mwaka kwa miaka {remainingYears} iliyobaki kati ya {termYears}, ili kupata {expectedMaturity} mwishoni: sawa na kupata {result} kwa mwaka kwa pesa hiyo. Kusitisha na kuweka akiba tofauti badala yake kungefikia {investValue}, tofauti ya {difference}.",
  },
};
