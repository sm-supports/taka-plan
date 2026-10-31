import { GET } from "../../server/api/rates/route";
export const onRequestGet = (ctx: { request: Request }) => GET(ctx.request);
