import { PrismaClient } from '@prisma/client';
import { DeepMockProxy } from 'vitest-mock-extended';
export declare const mockDb: DeepMockProxy<PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>>;
export declare function resetDbMock(): void;
