import { POST } from "../../../server/api/admin/discard/route";
export const onRequestPost = (ctx: { request: Request }) => POST(ctx.request);
