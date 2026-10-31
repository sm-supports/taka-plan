import { POST } from "../../../server/api/admin/login/route";
export const onRequestPost = (ctx: { request: Request }) => POST(ctx.request);
