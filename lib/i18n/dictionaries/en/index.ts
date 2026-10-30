import { about } from "./about";
import { admin } from "./admin";
import { common } from "./common";
import { errors } from "./errors";
import { explain } from "./explain";
import { m1 } from "./m1";
import { m3 } from "./m3";
import { m4 } from "./m4";
import { m5 } from "./m5";
import { onboarding } from "./onboarding";
import { plan } from "./plan";
import { terms } from "./terms";

/** English dictionary: the source of truth for the key shape (see lib/i18n/types.ts). */
export const en = { common, onboarding, plan, m1, m3, m4, m5, explain, terms, admin, errors, about } as const;
