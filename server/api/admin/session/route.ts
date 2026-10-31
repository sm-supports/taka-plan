import { isAdmin } from "@/lib/server/admin-auth";
import { json } from "@/lib/server/http";
import { NO_STORE } from "../shared";

/** GET → { admin } so the static admin shell can decide between sign-in and the editor. */
export async function GET(req: Request): Promise<Response> {
  return json({ admin: await isAdmin(req.headers.get("cookie")) }, { headers: NO_STORE });
}
