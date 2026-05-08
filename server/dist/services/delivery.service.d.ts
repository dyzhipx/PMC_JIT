export declare function getOrCreateDelivery(date: string, shiftKey: string, slotId: number, initialItems?: Array<{
    material: string;
    required: number;
}>): Promise<{
    items: {
        id: string;
        materialName: string;
        requiredPallets: number;
        scannedPallets: import("@prisma/client/runtime/library").Decimal | null;
        deliveryId: string;
    }[];
    scans: {
        id: string;
        uom: string | null;
        supplier: string | null;
        barcode: string | null;
        pcs: import("@prisma/client/runtime/library").Decimal | null;
        qtyPallet: number;
        targetBlockRowId: string | null;
        scannedAt: Date;
        deliveryId: string;
        deliveryItemId: string;
    }[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    date: Date;
    status: string;
    compositeKey: string;
    shiftKey: string;
    slotId: number;
}>;
export declare function addDeliveryItem(deliveryId: string, materialName: string, requiredPallets: number): Promise<{
    id: string;
    materialName: string;
    requiredPallets: number;
    scannedPallets: import("@prisma/client/runtime/library").Decimal | null;
    deliveryId: string;
}>;
export declare function getActiveDeliveries(): Promise<({
    items: {
        id: string;
        materialName: string;
        requiredPallets: number;
        scannedPallets: import("@prisma/client/runtime/library").Decimal | null;
        deliveryId: string;
    }[];
    scans: {
        id: string;
        uom: string | null;
        supplier: string | null;
        barcode: string | null;
        pcs: import("@prisma/client/runtime/library").Decimal | null;
        qtyPallet: number;
        targetBlockRowId: string | null;
        scannedAt: Date;
        deliveryId: string;
        deliveryItemId: string;
    }[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    date: Date;
    status: string;
    compositeKey: string;
    shiftKey: string;
    slotId: number;
})[]>;
export declare function getDeliveryById(id: string): Promise<({
    items: {
        id: string;
        materialName: string;
        requiredPallets: number;
        scannedPallets: import("@prisma/client/runtime/library").Decimal | null;
        deliveryId: string;
    }[];
    scans: {
        id: string;
        uom: string | null;
        supplier: string | null;
        barcode: string | null;
        pcs: import("@prisma/client/runtime/library").Decimal | null;
        qtyPallet: number;
        targetBlockRowId: string | null;
        scannedAt: Date;
        deliveryId: string;
        deliveryItemId: string;
    }[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    date: Date;
    status: string;
    compositeKey: string;
    shiftKey: string;
    slotId: number;
}) | null>;
export declare function scanDeliveryItem(deliveryId: string, material: string, barcode: string, qtyPallet: number, pcs: number, supplier: string, targetBlockRowId?: string): Promise<{
    success: boolean;
    message: string;
    isComplete?: undefined;
} | {
    success: boolean;
    message: string;
    isComplete: any;
}>;
export declare function validateDelivery(deliveryId: string): Promise<{
    success: boolean;
    message: string;
}>;
export declare function refreshDelivery(date: string, shiftKey: string, slotId: number, initialItems?: Array<{
    material: string;
    required: number;
}>): Promise<{
    items: {
        id: string;
        materialName: string;
        requiredPallets: number;
        scannedPallets: import("@prisma/client/runtime/library").Decimal | null;
        deliveryId: string;
    }[];
    scans: {
        id: string;
        uom: string | null;
        supplier: string | null;
        barcode: string | null;
        pcs: import("@prisma/client/runtime/library").Decimal | null;
        qtyPallet: number;
        targetBlockRowId: string | null;
        scannedAt: Date;
        deliveryId: string;
        deliveryItemId: string;
    }[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    date: Date;
    status: string;
    compositeKey: string;
    shiftKey: string;
    slotId: number;
}>;
export declare function isBarcodeInActiveDelivery(barcode: string): Promise<{
    delivery: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        status: string;
        compositeKey: string;
        shiftKey: string;
        slotId: number;
    };
    scan: {
        id: string;
        uom: string | null;
        supplier: string | null;
        barcode: string | null;
        pcs: import("@prisma/client/runtime/library").Decimal | null;
        qtyPallet: number;
        targetBlockRowId: string | null;
        scannedAt: Date;
        deliveryId: string;
        deliveryItemId: string;
    };
    item: {
        id: string;
        materialName: string;
        requiredPallets: number;
        scannedPallets: import("@prisma/client/runtime/library").Decimal | null;
        deliveryId: string;
    } | null;
} | null>;
