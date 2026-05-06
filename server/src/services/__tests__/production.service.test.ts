import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';

// We use an async factory for vi.mock to safely await vitest-mock-extended in ESM
vi.mock('../../config/database.js', async () => {
  const { mockDeep } = await import('vitest-mock-extended');
  // Need to use any here because vi.mock is isolated and can't use outer imports easily, or just mock it as any inside the factory
  const prismaMock: any = mockDeep();
  
  // Custom transaction implementation for production.service
  prismaMock.$transaction.mockImplementation(async (callback: any) => {
    return callback(prismaMock);
  });
  
  return { db: prismaMock };
});

// Re-import the mocked db to get the reference
import { db } from '../../config/database.js';
const prismaMock = db as ReturnType<typeof mockDeep<PrismaClient>>;

// We also need to mock transitService because receiveToLine calls it
vi.mock('../transit.service.js', () => ({
  takeFromTransit: vi.fn()
}));
import * as transitService from '../transit.service.js';

// 2. Import service AFTER mocking
import * as productionService from '../production.service.js';

describe('Production Service (Unit)', () => {
  beforeEach(() => {
    mockReset(prismaMock);
    vi.clearAllMocks();
    
    // Default transaction mock
    prismaMock.$transaction.mockImplementation(async (callback: any) => {
      return callback(prismaMock);
    });
    
    prismaMock.$executeRawUnsafe.mockResolvedValue([] as any);
  });

  describe('receiveToLine', () => {
    it('should fail if missing required params', async () => {
      const result = await productionService.receiveToLine('', 'MAT', 'BAR123', 10);
      expect(result.success).toBe(false);
      expect(result.message).toContain('harus diisi');
    });

    it('should fail if barcode is not in transit inventory', async () => {
      prismaMock.transitInventory.findFirst.mockResolvedValue(null);

      const result = await productionService.receiveToLine('LINE_1', 'MAT', 'BAR123', 10);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('tidak di transit');
    });

    it('should fail if strict validation on inputPcs does not match expected pcs', async () => {
      // Mock that it is in transit
      prismaMock.transitInventory.findFirst.mockResolvedValue({ barcode: 'BAR123', materialName: 'MAT' } as any);
      
      // Mock the strict validation query
      prismaMock.stockMutation.findFirst.mockResolvedValue({ qty: '20' } as any);

      const result = await productionService.receiveToLine('LINE_1', 'MAT', 'BAR123', 10);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Coba cek kembali jumlah Qty');
    });

    it('should succeed if all checks pass and transit take is successful', async () => {
      prismaMock.transitInventory.findFirst.mockResolvedValue({ barcode: 'BAR123', supplier: 'SupA' } as any);
      prismaMock.stockMutation.findFirst.mockResolvedValue({ qty: '10' } as any); // Strict validation matches 10
      
      // Mock the transit deductor
      vi.mocked(transitService.takeFromTransit).mockResolvedValue({ success: true } as any);
      
      // Mock line stock check (not existing)
      prismaMock.lineStock.findFirst.mockResolvedValue(null);

      const result = await productionService.receiveToLine('LINE_1', 'MAT', 'BAR123', 10);
      
      expect(result.success).toBe(true);
      expect(transitService.takeFromTransit).toHaveBeenCalledOnce();
      expect(prismaMock.lineStock.create).toHaveBeenCalledOnce();
      expect(prismaMock.lineBarcode.create).toHaveBeenCalledOnce();
    });
  });
});
