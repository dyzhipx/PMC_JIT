export declare function getStats(): Promise<{
    totalSKU: number;
    totalBOM: number;
    totalBox: number;
    pending: number;
    dates: any[];
}>;
export declare function getDailyProduction(): Promise<{
    date: string;
    sh1: number;
    sh2: number;
    sh3: number;
    total: number;
}[]>;
export declare function getRecentSchedules(): Promise<{
    date: any;
    skuCount: any;
    total: any;
    status: any;
}[]>;
