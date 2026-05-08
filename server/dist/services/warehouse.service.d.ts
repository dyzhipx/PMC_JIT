export declare function getWarehouseStock(): Promise<{
    id: string;
    supplierId: string | null;
    createdAt: Date;
    materialName: string;
    qtyPerPallet: import("@prisma/client/runtime/library").Decimal | null;
    mid: string;
    barcode: string;
    supplierName: string | null;
    palletsAvailable: number;
    dateIn: Date;
    timeIn: Date;
}[]>;
export declare function addWarehouseStock(data: {
    material: string;
    supplier: string;
    supplierId?: string;
    qtyPerPallet: number;
    palletsTotal: number;
    dateIn?: string;
}): Promise<{
    mid: string;
    barcodeRange: {
        start: string;
        end: string;
        barcodes: string[];
    };
    items: {
        id: string;
        supplierId: string | null;
        createdAt: Date;
        materialName: string;
        qtyPerPallet: import("@prisma/client/runtime/library").Decimal | null;
        mid: string;
        barcode: string;
        supplierName: string | null;
        palletsAvailable: number;
        dateIn: Date;
        timeIn: Date;
    }[];
}>;
export declare function deleteWarehouseStock(id: string): Promise<void>;
export declare function consumeFromWMS(material: string, qtyPallet: number, barcode?: string, tx?: any): Promise<any[]>;
/**
 * Get current system counters.
 */
export declare function getCounters(): Promise<{
    barcodeCounter: number;
    midCounter: number;
}>;
/**
 * Initialize system counters if they don't exist.
 */
export declare function ensureCounters(): Promise<void>;
export declare function requestWarehouseOutbound(barcode: string, destination: string): Promise<{
    success: boolean;
    message: string;
}>;
