import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';
import { db } from '../config/database.js';

// We mock the internal exported `db` variable from our config.
// Use `mockDb` in your tests to assert calls (e.g. mockDb.transitInventory.findMany.mockResolvedValue)
export const mockDb = mockDeep<PrismaClient>();

// Helper to reset the mock between tests
export function resetDbMock() {
  mockReset(mockDb);
}
