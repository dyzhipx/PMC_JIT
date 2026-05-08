import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockReset } from 'vitest-mock-extended';
// We use an async factory for vi.mock to safely await vitest-mock-extended in ESM
vi.mock('../../config/database.js', async () => {
    const { mockDeep } = await import('vitest-mock-extended');
    const prismaMock = mockDeep();
    return { db: prismaMock };
});
vi.mock('../master.service.js', () => ({
    getMaterialUOM: vi.fn().mockResolvedValue('PCS'),
    getPalletQty: vi.fn().mockResolvedValue(10),
    getFullBlockLayout: vi.fn().mockResolvedValue([])
}));
// Re-import the mocked db to get the reference
import { db } from '../../config/database.js';
const prismaMock = db;
// 2. Import service AFTER mocking
import * as transitService from '../transit.service.js';
describe('Transit Service (Unit)', () => {
    beforeEach(() => {
        mockReset(prismaMock);
        prismaMock.$executeRawUnsafe.mockResolvedValue([]);
    });
    describe('getTransitInventory', () => {
        it('should return inventory items and not trigger background repair if data is complete', async () => {
            // Setup mock return
            prismaMock.transitInventory.findMany.mockResolvedValue([
                { id: '1', materialName: 'PACKAGING-1', qtyPallets: 1, supplier: 'Supplier A', mid: '123' }
            ]);
            const result = await transitService.getTransitInventory();
            expect(result).toHaveLength(1);
            expect(result[0].materialName).toBe('PACKAGING-1');
            expect(prismaMock.transitInventory.findMany).toHaveBeenCalledOnce();
            // Second call (which is the repair call) should NOT happen
        });
        it('should quietly branch into background repair if supplier is missing', async () => {
            // Setup mock return with incomplete data
            prismaMock.transitInventory.findMany.mockResolvedValueOnce([
                { id: '1', materialName: 'PACKAGING-1', qtyPallets: 1, supplier: '-', mid: '123' }
            ]);
            // Setup the repair's findMany to resolve to empty
            prismaMock.transitInventory.findMany.mockResolvedValueOnce([]);
            const result = await transitService.getTransitInventory();
            expect(result).toHaveLength(1);
            expect(result[0].supplier).toBe('-');
            // Allow minor background promises to flush if they are synchronous microtasks
            await new Promise(r => setTimeout(r, 0));
            // Because we triggered repairTransitData, findMany is called again inside it
            expect(prismaMock.transitInventory.findMany).toHaveBeenCalledTimes(2);
        });
    });
    describe('takeFromTransit', () => {
        it('should handle zero qty requested by returning early without database operations', async () => {
            const result = await transitService.takeFromTransit('MAT', 0, 'LINE_1');
            expect(result.success).toBe(true);
            expect(result.message).toContain('Diambil 0');
        });
        it('should return failure object if insufficient stock across all instances', async () => {
            // Mock live stock, blockRows, and inventory resolving to empty arrays
            prismaMock.transitStockLive.findMany.mockResolvedValue([]);
            prismaMock.blockRow.findMany.mockResolvedValue([]);
            prismaMock.transitInventory.findMany.mockResolvedValue([]);
            const result = await transitService.takeFromTransit('MAT', 5, 'LINE_1');
            expect(result.success).toBe(false);
            expect(result.message).toContain('kurang 5 pallet');
        });
    });
});
