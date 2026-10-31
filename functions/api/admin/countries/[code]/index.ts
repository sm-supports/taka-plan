import { GET, PUT } from "../../../../../server/api/admin/countries/country/route";
import { paramOf } from "../../../../../server/api/countries/shared";
type Ctx = { request: Request; params: Record<string, string | string[] | undefined> };
export const onRequestGet = (ctx: Ctx) => GET(ctx.request, paramOf(ctx.params.code));
export const onRequestPut = (ctx: Ctx) => PUT(ctx.request, paramOf(ctx.params.code));
