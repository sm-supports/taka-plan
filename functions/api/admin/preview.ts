import { GET } from "../../../server/api/admin/preview/route";
export const onRequestGet = (ctx: { request: Request }) => GET(ctx.request);
