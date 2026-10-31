// Shape of the persisted client state (localStorage "taka-plan.v1") and its actions.
import type {
  BucketAmounts,
  Card,
  CountryCode,
  CoverPerson,
  ExistingPolicy,
  Goal,
  Loan,
  LoanScenario,
  Locale,
  M1Input,
  M6RiskAnswers,
  M7IncomeSources,
  M7Mode,
  Money,
  Profile,
  Rate,
  RetireeType,
  RiskProfile,
  Sex,
} from "@taka/engine";

export interface OnboardingState {
  step: 1 | 2 | 3 | 4 | 5;
  completed: boolean;
  disclaimerSeen: boolean;
}

/** User overrides for the emergency-fund calculator; everything else derives from the profile. */
export interface M1Overrides extends Partial<Pick<M1Input, "soleEarner" | "hasHealthInsurance" | "liquidSavings" | "monthsOverride" | "buildMonths">> {}

export interface M3State {
  loans: Loan[];
  cards: Card[];
  extraMonthly?: Money;
  scenario?: LoanScenario;
}

export interface M4State {
  savingsRate?: Rate;
  payday?: number;
  last6Incomes?: Money[];
}

export interface M5State {
  goals: Goal[];
}

/** M2 insurance & health answers; everything else (age, dependents, income, debts) comes from the profile and M3/M5. */
export interface M2State {
  smoker?: boolean;
  coverToAge?: number;
  incomeShare?: Rate;
  childrenCount?: number;
  youngestChildAge?: number;
  parentsCount?: number;
  parentAge?: number;
  investments?: Money;
  existingLifeCover?: Money;
  existingHealthCover?: Money;
  healthCovered?: CoverPerson[];
  policy?: ExistingPolicy;
}

/** M6 asset allocation answers. */
export interface M6State {
  risk?: Partial<M6RiskAnswers>;
  profileOverride?: RiskProfile;
  goldShare?: Rate;
  horizonYears?: number;
  lumpSum?: Money;
  monthly?: Money;
  holdings?: BucketAmounts;
  newMoney?: Money;
  propertyValue?: Money;
  directShares?: boolean;
}

/** M7 retirement & family answers. */
export interface M7State {
  mode?: M7Mode;
  sex?: Sex;
  retirementAge?: number;
  planToAge?: number;
  monthlySpending?: Money;
  savings?: Money;
  monthlySaving?: Money;
  sources?: M7IncomeSources;
  retireeType?: RetireeType;
  otherMonthlyIncome?: Money;
}

/** Everything the user answered: what a draft keeps. */
export interface DraftAnswers {
  country: CountryCode;
  locale: Locale;
  profile: Partial<Profile>;
  m1: M1Overrides;
  m2: M2State;
  m3: M3State;
  m4: M4State;
  m5: M5State;
  m6: M6State;
  m7: M7State;
}

/** An earlier set of answers, kept when the user started again (see lib/store/drafts.ts). */
export interface Draft {
  id: string;
  /** ISO timestamps. */
  createdAt: string;
  updatedAt: string;
  /** Optional name the user gave it; otherwise the UI labels it from its answers. */
  name?: string;
  /** Hash of the normalised answers; equal hash = same draft (never duplicated). */
  hash: string;
  answers: DraftAnswers;
}

/** The data half of the store: this is what gets persisted. */
export interface TakaData {
  schemaVersion: 2;
  /** ISO 3166-1 alpha-2 of the user's country (drives currency and country data). */
  country: CountryCode;
  locale: Locale;
  onboarding: OnboardingState;
  profile: Partial<Profile>;
  m1: M1Overrides;
  m2: M2State;
  m3: M3State;
  m4: M4State;
  m5: M5State;
  m6: M6State;
  m7: M7State;
  drafts: Draft[];
}

export interface TakaActions {
  setLocale(l: Locale): void;
  setProfile(patch: Partial<Profile>): void;
  setOnboardingStep(step: OnboardingState["step"]): void;
  completeOnboarding(): void;
  markDisclaimerSeen(): void;
  setM1(patch: M1Overrides): void;
  addLoan(l: Loan): void;
  updateLoan(id: string, patch: Partial<Loan>): void;
  removeLoan(id: string): void;
  addCard(c: Card): void;
  updateCard(id: string, patch: Partial<Card>): void;
  removeCard(id: string): void;
  setM3(patch: Partial<Pick<M3State, "extraMonthly" | "scenario">>): void;
  setM4(patch: M4State): void;
  addGoal(g: Goal): void;
  updateGoal(id: string, patch: Partial<Goal>): void;
  removeGoal(id: string): void;
  setCountry(code: CountryCode): void;
  setM2(patch: M2State): void;
  setM6(patch: M6State): void;
  setM7(patch: M7State): void;
  /**
   * "Start from the beginning": saves the current answers as a draft (refreshing an identical one
   * instead of duplicating it), then clears the answers. Country, language and the disclaimer stay.
   */
  startOver(): void;
  /**
   * A different country mid-plan: the answers are amounts in the old currency, so they are kept as a
   * draft (startOver's rule) and cleared, then `code` becomes the country. Same country: no-op.
   */
  switchCountry(code: CountryCode): void;
  /** Saves the current answers as a draft (deduplicated), then loads draft `id` as the current answers. */
  openDraft(id: string): void;
  renameDraft(id: string, name: string): void;
  deleteDraft(id: string): void;
  reset(): void;
}

export type TakaState = TakaData & TakaActions;

/** Fresh state for a first-time visitor (Bangla first, onboarding at step 1). */
export const INITIAL_DATA: TakaData = {
  schemaVersion: 2,
  country: "BD",
  locale: "bn",
  onboarding: { step: 1, completed: false, disclaimerSeen: false },
  profile: {},
  m1: {},
  m2: {},
  m3: { loans: [], cards: [] },
  m4: {},
  m5: { goals: [] },
  m6: {},
  m7: {},
  drafts: [],
};

/** The answer slices with nothing filled in (used by startOver). */
export const EMPTY_ANSWERS: Omit<DraftAnswers, "country" | "locale"> = {
  profile: {},
  m1: {},
  m2: {},
  m3: { loans: [], cards: [] },
  m4: {},
  m5: { goals: [] },
  m6: {},
  m7: {},
};
