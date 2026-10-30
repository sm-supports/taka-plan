// Anonymous analytics hook (PRD: onboarding drop-off, plan reached, card opened, "why" taps).
// No-op for now: no provider is wired, and nothing personal may ever be sent.
export function track(_event: string, _props?: Record<string, string | number | boolean>): void {}
