import { POST } from "../../../server/api/admin/publish/route";
export const onRequestPost = (ctx: { request: Request }) => POST(ctx.request);
