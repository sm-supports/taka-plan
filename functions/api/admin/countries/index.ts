import { GET } from "../../../../server/api/admin/countries/route";
export const onRequestGet = (ctx: { request: Request }) => GET(ctx.request);
