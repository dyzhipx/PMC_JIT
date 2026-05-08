export declare function logActivity(user: string, module: string, action: string, details?: string): Promise<void>;
export declare function getAuditLogs(limit?: number, module?: string): Promise<any>;
