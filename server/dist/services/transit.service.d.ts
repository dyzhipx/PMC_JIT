export declare function getTransitInfo(): Promise<{
    blocks: any[];
    materials: Record<string, number>;
    materialsPcs: Record<string, number>;
}>;
export declare function getTransitInventory(): Promise<{
    id: string;
    createdAt: Date;
    supplier: string | null;
    materialName: string;
    blockRowId: string | null;
    blockId: string | null;
    mid: string | null;
    barcode: string;
    palletsAvailable: number;
    pcs: import("@prisma/client/runtime/library").Decimal | null;
    dateInGudang: Date | null;
    dateInTransit: Date;
    timeInTransit: Date;
}[]>;
export declare function receiveToTransit(material: string, qtyPallet: number, barcode: string, actualPcs: number | null, source?: string, targetBlockRowId?: string, supplier?: string, tx?: any, midOverride?: string, dateInGudangOverride?: Date): Promise<{
    success: boolean;
    message: string;
    blockId?: undefined;
    blockRowId?: undefined;
} | {
    success: boolean;
    message: string;
    blockId: any;
    blockRowId: any;
}>;
export declare function takeFromTransit(material: string, qty: number, line?: string, forcedPcs?: number, tx?: any, barcode?: string): Promise<{
    success: boolean;
    message: string;
}>;
export declare function markBarcodeUsed(barcode: string, tx?: any): Promise<void>;
export declare function isBarcodeUsed(barcode: string): Promise<boolean>;
export declare function getUsedBarcodes(): Promise<{
    id: string;
    barcode: string;
    usedAt: Date;
}[]>;
export declare function getStockCheck(date: string): Promise<({
    entries: {
        id: string;
        stockCheckId: string;
        blockRowId: string;
        palletIndex: number;
        quantity: import("@prisma/client/runtime/library").Decimal | null;
    }[];
} & {
    id: string;
    createdAt: Date;
    checkDate: Date;
    checkedBy: string | null;
}) | null>;
export declare function saveStockCheck(date: string, entries: Array<{
    blockRowId: string;
    palletIndex: number;
    quantity: string | null;
}>, checkedBy?: string): Promise<{
    id: string;
    createdAt: Date;
    checkDate: Date;
    checkedBy: string | null;
}>;
export declare function getMutationReport(filters?: {
    material?: string;
    startDate?: string;
    endDate?: string;
    line?: string;
    blockId?: string;
    blockRowId?: string;
}, page?: number, limit?: number): Promise<{
    data: {
        id: string;
        uom: string;
        createdAt: Date;
        skuId: string | null;
        line: string | null;
        materialName: string;
        date: Date;
        blockRowId: string | null;
        blockId: string | null;
        barcode: string | null;
        time: Date;
        type: string;
        source: string | null;
        qty: import("@prisma/client/runtime/library").Decimal;
    }[];
    metadata: {
        totalCount: number;
        totalPages: number;
        currentPage: number;
    };
}>;
export declare function requestTransitOutbound(barcode: string, destination: string, targetLine?: string): Promise<{
    success: boolean;
    message: string;
}>;
export declare function getTransitOutboundPending(): Promise<{
    id: string;
    createdAt: Date;
    supplier: string | null;
    materialName: string;
    date: Date;
    status: string | null;
    blockRowId: string | null;
    blockId: string | null;
    barcode: string;
    time: Date;
    pcs: import("@prisma/client/runtime/library").Decimal | null;
    destination: string;
    targetLine: string | null;
}[]>;
export declare function verifyTransitOutbound(id: string, action: "accept" | "reject"): Promise<{
    success: boolean;
    message: string;
}>;
export declare function relocateTransitPallet(barcode: string, targetBlockRowId: string, user?: string): Promise<{
    success: boolean;
    message: string;
}>;
export declare function getTransitOpnames(filters?: {
    blockId?: string;
}): Promise<({
    items: {
        id: string;
        materialName: string;
        blockRowId: string;
        qtyBook: import("@prisma/client/runtime/library").Decimal;
        qtyPhysical: import("@prisma/client/runtime/library").Decimal;
        delta: import("@prisma/client/runtime/library").Decimal;
        calculatorNotes: string | null;
        transitOpnameId: string;
    }[];
} & {
    id: string;
    createdAt: Date;
    date: Date;
    checkedBy: string | null;
    blockId: string;
    type: string;
    notes: string | null;
})[]>;
export declare function saveTransitOpname(payload: {
    date: string;
    type: string;
    blockId: string;
    checkedBy?: string;
    items: any[];
}): Promise<{
    success: boolean;
    message: string;
}>;
export declare function updateTransitOpnameItem(opnameId: string, itemId: string, newQtyPhysical: number, editedBy: string): Promise<{
    success: boolean;
    message: string;
}>;
