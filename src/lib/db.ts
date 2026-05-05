import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
    // When DATABASE_URL starts with "file:" (SQLite local dev), the standard
    // PrismaClient is used — no network adapter needed.
    // When DATABASE_URL is a PostgreSQL / Neon URL (production on Vercel), Prisma
    // connects via the pg driver. The Neon pooler handles connection management.
    return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Reuse single instance across hot-reloads in dev to avoid connection pool exhaustion.
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
