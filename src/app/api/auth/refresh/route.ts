import { createRefreshAuthRouter } from "@insforge/sdk/ssr";

import { getInsforgeConfig } from "@/lib/insforge-config";

export const { POST } = createRefreshAuthRouter(getInsforgeConfig());
