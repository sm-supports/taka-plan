/**
 * Bidi isolation for amounts on right-to-left pages. Arabic and Urdu number formats carry a
 * right-to-left mark, so an amount at the start of a line ("৳9,600/month") flips the whole line and
 * its punctuation. Wrapping such an amount in FSI … PDI isolates it: the line takes its direction from
 * its words and the amount keeps its own order. Text without a direction mark (every left-to-right
 * locale) is returned unchanged.
 */
const FSI = "⁨";
const PDI = "⁩";
const MARKS = /[‎‏؜]/;

export function iso(s: string): string {
  return MARKS.test(s) ? `${FSI}${s}${PDI}` : s;
}
