import type { Dictionary } from "../../types";
import { about } from "./about";
import { admin } from "./admin";
import { common } from "./common";
import { errors } from "./errors";
import { explain } from "./explain";
import { m1 } from "./m1";
import { m2 } from "./m2";
import { m3 } from "./m3";
import { m4 } from "./m4";
import { m5 } from "./m5";
import { m6 } from "./m6";
import { m7 } from "./m7";
import { onboarding } from "./onboarding";
import { plan } from "./plan";
import { terms } from "./terms";

/** Portuguese dictionary. Typed against the English shape, so a missing or extra key fails typecheck. */
export const pt: Dictionary = { common, onboarding, plan, m1, m2, m3, m4, m5, m6, m7, explain, terms, admin, errors, about };
