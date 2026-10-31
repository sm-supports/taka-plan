import { GET } from "../../../../../server/api/admin/countries/preview/route";
import { paramOf } from "../../../../../server/api/countries/shared";
type Ctx = { request: Request; params: Record<string, string | string[] | undefined> };
export const onRequestGet = (ctx: Ctx) => GET(ctx.request, paramOf(ctx.params.code));
