import { PrismaClient } from '@prisma/client';

// Instance unique de Prisma Client
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
});

// Gestion de la fermeture propre de la connexion
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Export du client
export default prisma;
