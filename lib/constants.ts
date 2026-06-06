import type { RiskLevel } from "@/lib/types";

export const RISK_LEVEL_ORDER: RiskLevel[] = ["RED", "YELLOW", "CONTEXT_DEPENDENT", "GREEN"];

export const MAX_SHARE_PAYLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
