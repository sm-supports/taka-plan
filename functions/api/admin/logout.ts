import { POST } from "../../../server/api/admin/logout/route";
export const onRequestPost = (ctx: { request: Request }) => POST(ctx.request);
