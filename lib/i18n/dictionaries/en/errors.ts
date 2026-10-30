export const errors = {
  generic: "Something went wrong. Please try again.",
  offline: "You're offline. Saved rates are being used; reconnect to get the latest.",
  engineNotReady: "This calculator is still being set up.",
  invalidInput: "Some of these numbers don't add up. Check them and try again.",
  missingRate: "A rate this calculator needs is missing. Please try again later.",
  notFound: "We couldn't find that page.",
  unauthorized: "You need to sign in to see this page.",
  ratesUnavailable: "The rates table could not be loaded. Check your connection and try again.",
} as const;
