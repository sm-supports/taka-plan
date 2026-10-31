import { GET } from "../../../server/api/admin/session/route";
export const onRequestGet = (ctx: { request: Request }) => GET(ctx.request);
