export declare function getLineStockAll(): Promise<{
    id: string;
    line: string;
    materialName: string;
    pcs: import("@prisma/client/runtime/library").Decimal | null;
    qtyPallets: number;
}[]>;
export declare function getLineStockByLine(line: string): Promise<{
    id: string;
    line: string;
    materialName: string;
    pcs: import("@prisma/client/runtime/library").Decimal | null;
    qtyPallets: number;
}[]>;
export declare function getLineBarcodes(line?: string): Promise<{
    id: string;
    supplier: string | null;
    line: string;
    materialName: string;
    barcode: string;
    dateIn: Date;
    timeIn: Date;
    pcs: import("@prisma/client/runtime/library").Decimal | null;
}[]>;
export declare function receiveToLine(line: string, material: string, barcode: string, inputPcs: number): Promise<{
    success: boolean;
    message: string;
}>;
export declare function receivePartialToLine(line: string, material: string, barcode: string, partialPcs: number): Promise<{
    success: boolean;
    message: string;
}>;
export declare function returnFromLine(barcode: string, pcsOverride?: number, targetBlockRowId?: string, condition?: string): Promise<{
    success: boolean;
    message: string;
}>;
export declare function returnSisaFromLine(line: string, materialName: string, pcs: number, targetBlockRowId?: string): Promise<{
    success: boolean;
    message: string;
}>;
export declare function getPendingReturns(): Promise<{
    id: string;
    createdAt: Date;
    supplier: string | null;
    line: string;
    materialName: string;
    date: Date;
    status: string | null;
    barcode: string;
    time: Date;
    pcs: import("@prisma/client/runtime/library").Decimal | null;
    targetBlockRowId: string | null;
    condition: string | null;
}[]>;
export declare function verifyReturn(id: string, action: "accept" | "reject"): Promise<{
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
export declare function getExternalOnhand(dest: string): Promise<{
    stock: {
        id: string;
        materialName: string;
        pcs: import("@prisma/client/runtime/library").Decimal | null;
        destination: string;
        qtyPallets: number;
    }[];
    barcodes: {
        id: string;
        supplier: string | null;
        materialName: string;
        barcode: string;
        dateIn: Date;
        timeIn: Date;
        pcs: import("@prisma/client/runtime/library").Decimal | null;
        destination: string;
    }[];
}>;
export declare function processLineReject(line: string, materialName: string, pcsInput: number, reason: string): Promise<{
    success: boolean;
    message: string;
}>;
export declare function verifyLineReject(id: string, action: "accept" | "reject", finalPcs?: number): Promise<{
    success: boolean;
    message: string;
}>;
export declare function getLineRejects(dateStr?: string): Promise<{
    id: string;
    createdAt: Date;
    supplier: string | null;
    line: string;
    materialName: string;
    date: Date;
    status: string;
    barcode: string | null;
    time: Date;
    pcs: import("@prisma/client/runtime/library").Decimal;
    reason: string;
}[]>;
export declare function saveLineOpname(data: {
    date: string;
    type: string;
    line: string;
    checkedBy?: string;
    notes?: string;
    items: Array<{
        materialName: string;
        qtyBook: number;
        qtyPhysical: number;
        calculatorNotes?: string;
    }>;
}): Promise<{
    success: boolean;
    opname: any;
    items: any[];
}>;
export declare function getLineOpnames(filters?: {
    line?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
}): Promise<({
    items: {
        id: string;
        materialName: string;
        qtyBook: import("@prisma/client/runtime/library").Decimal;
        qtyPhysical: import("@prisma/client/runtime/library").Decimal;
        delta: import("@prisma/client/runtime/library").Decimal;
        calculatorNotes: string | null;
        productionOpnameId: string;
    }[];
} & {
    id: string;
    createdAt: Date;
    line: string;
    date: Date;
    checkedBy: string | null;
    type: string;
    notes: string | null;
})[]>;
export declare function updateLineOpnameItem(opnameId: string, itemId: string, newQtyPhysical: number, editedBy: string): Promise<{
    success: boolean;
    message: string;
}>;
export declare function getLineMutations(filters?: {
    material?: string;
    startDate?: string;
    endDate?: string;
    line?: string;
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
