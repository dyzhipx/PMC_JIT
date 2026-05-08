export declare function getProductionMutationReport(filters?: {
    material?: string;
    line?: string;
    startDate?: string;
    endDate?: string;
}): Promise<{
    reportList: any[];
}>;
export declare function getTransitMutationReport(filters?: {
    material?: string;
    block?: string;
    row?: string;
    line?: string;
    sku?: string;
    startDate?: string;
    endDate?: string;
}): Promise<{
    reportList: any[];
    summary: {
        totalWarehouseIn: number;
        totalReturnIn: number;
        totalRelocIn: number;
        totalRelocOut: number;
        totalProductionOut: number;
    };
}>;
