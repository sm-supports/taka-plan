import { bindEnv, type TakaEnv } from "../../lib/server/env";
import { toResponse } from "../../lib/server/http";

type Ctx = { env: TakaEnv; next: () => Promise<Response> };

/** Runs only for /api/* (it lives in functions/api/), so static pages never invoke Functions. */
export const onRequest = async (ctx: Ctx): Promise<Response> => {
  bindEnv(ctx.env);
  try {
    return await ctx.next();
  } catch (e) {
    return toResponse(e);
  }
};
