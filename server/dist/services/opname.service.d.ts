interface RecapFilter {
    startDate?: string;
    endDate?: string;
    area?: string;
}
export declare function getOpnameRecapPivot(filters: RecapFilter): Promise<{
    lines: string[];
    rows: {
        materialName: string;
        oracleCode: string | null;
        uom: string;
        lineValues: Record<string, {
            qtyBook: number;
            qtyPhysical: number;
        }>;
        transit: {
            qtyBook: number;
            qtyPhysical: number;
        };
        totalBook: number;
        totalPhysical: number;
        selisih: number;
    }[];
    notOpnamed: {
        materialName: string;
        oracleCode: string | null;
        uom: string;
        lastKnownBook: number;
    }[];
}>;
export {};
