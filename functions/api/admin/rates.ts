import { GET, PUT } from "../../../server/api/admin/rates/route";
export const onRequestGet = (ctx: { request: Request }) => GET(ctx.request);
export const onRequestPut = (ctx: { request: Request }) => PUT(ctx.request);
