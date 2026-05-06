import { db as prisma } from "../config/database.js";

export async function logActivity(user: string, module: string, action: string, details?: string) {
  try {
    await (prisma as any).auditLog.create({
      data: {
        user,
        module,
        action,
        details
      }
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

export async function getAuditLogs(limit: number = 100, module?: string) {
  const whereClause = module ? { module } : {};
  
  return await (prisma as any).auditLog.findMany({
    where: whereClause,
    orderBy: {
      timestamp: 'desc'
    },
    take: limit
  });
}
