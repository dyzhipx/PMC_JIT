import { db as prisma } from "../config/database.js";
export async function logActivity(user, module, action, details) {
    try {
        await prisma.auditLog.create({
            data: {
                user,
                module,
                action,
                details
            }
        });
    }
    catch (error) {
        console.error("Failed to log activity:", error);
    }
}
export async function getAuditLogs(limit = 100, module) {
    const whereClause = module ? { module } : {};
    return await prisma.auditLog.findMany({
        where: whereClause,
        orderBy: {
            timestamp: 'desc'
        },
        take: limit
    });
}
