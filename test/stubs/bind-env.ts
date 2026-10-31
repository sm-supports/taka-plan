// Binds the stub env the way functions/api/_middleware.ts does in production.
import { bindEnv } from "@/lib/server/env";
import { testEnv } from "./test-env";
bindEnv(testEnv as never);
