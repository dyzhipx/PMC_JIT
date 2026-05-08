export declare function verifySkuAgainstSchedule(date: string, line: string, skuId: string): Promise<{
    match: boolean;
    message: string;
}>;
export declare function submitBpp(data: {
    bppNumber?: string;
    line: string;
    skuId: string;
    qty: number;
    shift?: number;
    date: string;
}): Promise<{
    bpp: any;
    items: any[];
}>;
export declare function getBppHistory(dateStr?: string, page?: number, limit?: number): Promise<{
    data: ({
        items: {
            id: string;
            materialName: string;
            productionBppId: string;
            qtyDeducted: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        skuId: string;
        line: string;
        shift: number | null;
        date: Date;
        status: string;
        qty: number;
        bppNumber: string;
    })[];
    metadata: {
        totalCount: number;
        totalPages: number;
        currentPage: number;
    };
}>;
export declare function editBpp(id: string, newQty: number, newSkuId: string): Promise<{
    bpp: any;
    items: any[];
}>;
