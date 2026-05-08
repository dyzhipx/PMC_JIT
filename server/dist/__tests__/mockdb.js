import { mockDeep, mockReset } from 'vitest-mock-extended';
// We mock the internal exported `db` variable from our config.
// Use `mockDb` in your tests to assert calls (e.g. mockDb.transitInventory.findMany.mockResolvedValue)
export const mockDb = mockDeep();
// Helper to reset the mock between tests
export function resetDbMock() {
    mockReset(mockDb);
}
