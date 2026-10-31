import { POST } from "../../../../../server/api/admin/countries/publish/route";
import { paramOf } from "../../../../../server/api/countries/shared";
type Ctx = { request: Request; params: Record<string, string | string[] | undefined> };
export const onRequestPost = (ctx: Ctx) => POST(ctx.request, paramOf(ctx.params.code));
