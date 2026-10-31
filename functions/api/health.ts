import { GET } from "../../server/api/health/route";
export const onRequestGet = (ctx: { request: Request }) => GET(ctx.request);
