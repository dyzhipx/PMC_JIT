import { PrismaClient } from "@prisma/client";
export declare const db: PrismaClient<{
    log: ("warn" | "error")[];
}, "warn" | "error", import("@prisma/client/runtime/library").DefaultArgs>;
