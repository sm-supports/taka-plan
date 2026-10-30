// Shape of the persisted client state (localStorage "taka-plan.v1") and its actions.
import type { Card, Goal, Loan, LoanScenario, Locale, M1Input, Money, Profile, Rate } from "@taka/engine";

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

/** The data half of the store: this is what gets persisted. */
export interface TakaData {
  schemaVersion: 1;
  locale: Locale;
  onboarding: OnboardingState;
  profile: Partial<Profile>;
  m1: M1Overrides;
  m3: M3State;
  m4: M4State;
  m5: M5State;
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
  reset(): void;
}

export type TakaState = TakaData & TakaActions;

/** Fresh state for a first-time visitor (Bangla first, onboarding at step 1). */
export const INITIAL_DATA: TakaData = {
  schemaVersion: 1,
  locale: "bn",
  onboarding: { step: 1, completed: false, disclaimerSeen: false },
  profile: {},
  m1: {},
  m3: { loans: [], cards: [] },
  m4: {},
  m5: { goals: [] },
};
