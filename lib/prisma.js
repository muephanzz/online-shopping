// lib/prisma.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'], // This enables detailed logging
  });
  
  export { prisma };
  
