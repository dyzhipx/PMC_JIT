interface AnomalyResult {
    barcode: string;
    materialName: string;
    supplier: string | null;
    timeInTransit: Date;
    shift: number;
    waitingHours: number;
    status: "Lupa Scan" | "Idle/Trouble";
    bppQtyDeducted: number;
}
export declare function getUnscannedTransit(anomalyThresholdHours?: number): Promise<AnomalyResult[]>;
export {};
