/**
 * Create a new Manual SPB
 */
export declare function createManualSpb(requestedBy: string, reason: string, items: Array<{
    materialName: string;
    qtyPallets: number;
    qtyPcs?: number;
    targetBlockRowId?: string;
}>, targetDate?: string, targetShift?: number): Promise<{
    items: {
        id: string;
        materialName: string;
        status: string;
        qtyPallets: number;
        scannedPallets: number;
        targetBlockRowId: string | null;
        qtyPcs: number | null;
        receivedPallets: number;
        spbId: string;
    }[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    reason: string | null;
    spbNumber: string;
    requestedBy: string;
    targetDate: Date | null;
    targetShift: number | null;
}>;
/**
 * Get all Manual SPBs with optional status filter
 */
export declare function getManualSpbs(status?: string, page?: number, limit?: number): Promise<{
    data: ({
        items: ({
            scans: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                supplier: string | null;
                status: string;
                barcode: string | null;
                pcs: number | null;
                targetBlockRowId: string | null;
                manualSpbItemId: string;
            }[];
        } & {
            id: string;
            materialName: string;
            status: string;
            qtyPallets: number;
            scannedPallets: number;
            targetBlockRowId: string | null;
            qtyPcs: number | null;
            receivedPallets: number;
            spbId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        reason: string | null;
        spbNumber: string;
        requestedBy: string;
        targetDate: Date | null;
        targetShift: number | null;
    })[];
    metadata: {
        totalCount: number;
        totalPages: number;
        currentPage: number;
    };
}>;
/**
 * Get a single Manual SPB by ID
 */
export declare function getManualSpbById(id: string): Promise<({
    items: ({
        scans: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            supplier: string | null;
            status: string;
            barcode: string | null;
            pcs: number | null;
            targetBlockRowId: string | null;
            manualSpbItemId: string;
        }[];
    } & {
        id: string;
        materialName: string;
        status: string;
        qtyPallets: number;
        scannedPallets: number;
        targetBlockRowId: string | null;
        qtyPcs: number | null;
        receivedPallets: number;
        spbId: string;
    })[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    reason: string | null;
    spbNumber: string;
    requestedBy: string;
    targetDate: Date | null;
    targetShift: number | null;
}) | null>;
/**
 * Process/scan an item from Manual SPB (Dispatch from Warehouse)
 * Consumes from WMS and marks as "shipping"
 */
export declare function processSpbItem(itemId: string, barcode: string, pcs: number, supplier: string, targetBlockRowId?: string): Promise<{
    success: boolean;
    message: string;
    isComplete: boolean;
}>;
/**
 * Receive a manual SPB barcode at Transit
 */
export declare function receiveSpbScan(barcode: string, actualPcs: number): Promise<{
    success: boolean;
    message: string;
    spbNumber: any;
    isSpbComplete: any;
} | null>;
/**
 * Delete a Manual SPB (only if no items have been scanned)
 */
export declare function deleteManualSpb(id: string): Promise<{
    success: boolean;
    message: string;
}>;
/**
 * Get manual SPB scan details by barcode
 */
export declare function getManualSpbScanByBarcode(barcode: string): Promise<({
    item: {
        spb: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            reason: string | null;
            spbNumber: string;
            requestedBy: string;
            targetDate: Date | null;
            targetShift: number | null;
        };
    } & {
        id: string;
        materialName: string;
        status: string;
        qtyPallets: number;
        scannedPallets: number;
        targetBlockRowId: string | null;
        qtyPcs: number | null;
        receivedPallets: number;
        spbId: string;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    supplier: string | null;
    status: string;
    barcode: string | null;
    pcs: number | null;
    targetBlockRowId: string | null;
    manualSpbItemId: string;
}) | null>;
