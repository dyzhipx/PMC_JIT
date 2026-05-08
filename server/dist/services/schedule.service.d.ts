export declare function getAllSchedules(filters?: {
    date?: string;
    line?: string;
    status?: string;
}): Promise<{
    id: string;
    createdAt: Date;
    skuId: string;
    line: string;
    date: Date;
    status: string;
    sh1: number;
    sh2: number;
    sh3: number;
}[]>;
export declare function getUniqueDates(): Promise<string[]>;
export declare function importSchedules(items: Array<{
    date: string;
    line: string;
    skuId: string;
    sh1: number;
    sh2: number;
    sh3: number;
    status?: string;
}>): Promise<{
    id: string;
    createdAt: Date;
    skuId: string;
    line: string;
    date: Date;
    status: string;
    sh1: number;
    sh2: number;
    sh3: number;
}[]>;
export declare function updateSchedule(id: string, data: Partial<{
    sh1: number;
    sh2: number;
    sh3: number;
    status: string;
}>): Promise<{
    id: string;
    createdAt: Date;
    skuId: string;
    line: string;
    date: Date;
    status: string;
    sh1: number;
    sh2: number;
    sh3: number;
}>;
export declare function deleteSchedule(id: string): Promise<void>;
export declare function markDateConverted(date: string): Promise<void>;
export declare function getShiftSummary(date: string): Promise<{
    total: number;
    skuName: string;
    skuId: string;
    sh1: number;
    sh2: number;
    sh3: number;
}[]>;
