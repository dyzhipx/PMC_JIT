export declare function getAllSkus(): Promise<{
    id: string;
    code: string;
    name: string;
    category: string | null;
    uom: string;
    supplierId: string | null;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare function getSkuById(id: string): Promise<{
    id: string;
    code: string;
    name: string;
    category: string | null;
    uom: string;
    supplierId: string | null;
    createdAt: Date;
    updatedAt: Date;
} | null>;
export declare function getSkuByCode(code: string): Promise<{
    id: string;
    code: string;
    name: string;
    category: string | null;
    uom: string;
    supplierId: string | null;
    createdAt: Date;
    updatedAt: Date;
} | null>;
export declare function createSku(data: {
    code: string;
    name: string;
    category?: string;
    uom?: string;
    supplierId?: string;
}): Promise<{
    id: string;
    code: string;
    name: string;
    category: string | null;
    uom: string;
    supplierId: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateSku(id: string, data: Partial<{
    code: string;
    name: string;
    category: string;
    uom: string;
    supplierId: string;
}>): Promise<{
    id: string;
    code: string;
    name: string;
    category: string | null;
    uom: string;
    supplierId: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function deleteSku(id: string): Promise<void>;
export declare function getAllBoms(): Promise<{
    id: string;
    uom: string;
    skuId: string;
    line: string | null;
    materialName: string;
    coefficient: import("@prisma/client/runtime/library").Decimal;
    rounding: string;
    oracleCode: string | null;
    sortOrder: number | null;
}[]>;
export declare function getBomBySkuId(skuId: string): Promise<{
    id: string;
    uom: string;
    skuId: string;
    line: string | null;
    materialName: string;
    coefficient: import("@prisma/client/runtime/library").Decimal;
    rounding: string;
    oracleCode: string | null;
    sortOrder: number | null;
}[]>;
export declare function addBomComponent(skuId: string, data: {
    materialName: string;
    coefficient: any;
    uom: string;
    rounding?: string;
    oracleCode?: string;
    line?: string;
    sortOrder?: number;
}): Promise<{
    id: string;
    uom: string;
    skuId: string;
    line: string | null;
    materialName: string;
    coefficient: import("@prisma/client/runtime/library").Decimal;
    rounding: string;
    oracleCode: string | null;
    sortOrder: number | null;
}>;
export declare function updateBomComponent(id: string, data: Partial<{
    materialName: string;
    coefficient: any;
    uom: string;
    rounding: string;
    oracleCode: string;
    sortOrder: number;
}>): Promise<{
    id: string;
    uom: string;
    skuId: string;
    line: string | null;
    materialName: string;
    coefficient: import("@prisma/client/runtime/library").Decimal;
    rounding: string;
    oracleCode: string | null;
    sortOrder: number | null;
}>;
export declare function deleteBomComponent(id: string): Promise<void>;
export declare function getAllSuppliers(): Promise<{
    id: string;
    code: string;
    name: string;
    createdAt: Date;
    contact: string | null;
    address: string | null;
}[]>;
export declare function createSupplier(data: {
    code: string;
    name: string;
    contact?: string;
    address?: string;
}): Promise<{
    id: string;
    code: string;
    name: string;
    createdAt: Date;
    contact: string | null;
    address: string | null;
}>;
export declare function updateSupplier(id: string, data: Partial<{
    code: string;
    name: string;
    contact: string;
    address: string;
}>): Promise<{
    id: string;
    code: string;
    name: string;
    createdAt: Date;
    contact: string | null;
    address: string | null;
}>;
export declare function deleteSupplier(id: string): Promise<void>;
export declare function getAllLineSkuMappings(): Promise<{
    id: string;
    skuId: string;
    line: string;
}[]>;
export declare function getLinesForSku(skuId: string): Promise<any[]>;
export declare function getSkusForLine(line: string): Promise<any[]>;
export declare function addLineSkuMapping(skuId: string, line: string): Promise<{
    id: string;
    skuId: string;
    line: string;
}>;
export declare function deleteLineSkuMapping(skuId: string, line: string): Promise<void>;
export declare function getAllPalletQty(tx?: any): Promise<any>;
export declare function getPalletQty(materialName: string, tx?: any): Promise<number>;
export declare function setPalletQty(materialName: string, qtyPerPallet: number): Promise<{
    id: string;
    materialName: string;
    qtyPerPallet: number;
}>;
export declare function getAllUom(): Promise<{
    id: string;
    uom: string;
    unit: string;
    conversion: string | null;
}[]>;
export declare function getFullBlockLayout(tx?: any): Promise<any>;
export declare function saveFullBlockLayout(layout: Array<{
    blockNumber: number;
    skuCategories?: string[];
    rows: Array<{
        rowNumber: number;
        materialName: string;
        maxPallets: number;
        assignedLines?: string[];
        isFlexible?: boolean;
    }>;
}>): Promise<void>;
/**
 * Get material UOM from BOM data.
 */
export declare function getMaterialUOM(materialName: string, tx?: any): Promise<string>;
export declare function getMaterialReceh(): Promise<{
    id: string;
    createdAt: Date;
    materialName: string;
}[]>;
export declare function addMaterialReceh(materialName: string): Promise<{
    success: boolean;
    message: string;
}>;
export declare function removeMaterialReceh(materialName: string): Promise<{
    success: boolean;
    message: string;
}>;
export declare function getAllKamusOpname(): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    materialName: string;
    oracleCode: string | null;
    beratRollUtuh: import("@prisma/client/runtime/library").Decimal | null;
    beratCore: import("@prisma/client/runtime/library").Decimal | null;
    jumlahSachet: number | null;
}[]>;
export declare function createKamusOpname(data: {
    materialName: string;
    oracleCode?: string;
    beratRollUtuh?: number;
    beratCore?: number;
    jumlahSachet?: number;
}): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    materialName: string;
    oracleCode: string | null;
    beratRollUtuh: import("@prisma/client/runtime/library").Decimal | null;
    beratCore: import("@prisma/client/runtime/library").Decimal | null;
    jumlahSachet: number | null;
}>;
export declare function updateKamusOpname(id: string, data: Partial<{
    materialName: string;
    oracleCode: string;
    beratRollUtuh: number;
    beratCore: number;
    jumlahSachet: number;
}>): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    materialName: string;
    oracleCode: string | null;
    beratRollUtuh: import("@prisma/client/runtime/library").Decimal | null;
    beratCore: import("@prisma/client/runtime/library").Decimal | null;
    jumlahSachet: number | null;
}>;
export declare function deleteKamusOpname(id: string): Promise<void>;
export declare function deleteMultipleKamusOpname(ids: string[]): Promise<{
    success: boolean;
    message: string;
}>;
