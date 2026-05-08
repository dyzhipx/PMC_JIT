/**
 * Get next barcode range by atomically incrementing the counter.
 */
export declare function getNextBarcodeRange(count: number): Promise<{
    start: string;
    end: string;
    barcodes: string[];
}>;
/**
 * Get next MID (Material ID) atomically.
 */
export declare function getNextMID(): Promise<string>;
