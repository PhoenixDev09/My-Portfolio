import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Flushing existing Theme History to force AI to re-read coreContent.ts...');
  
  // Wipe all cached content generations
  await prisma.themeHistory.deleteMany({});
  await prisma.interaction.deleteMany({});
  
  console.log('Database flushed successfully!');
  console.log('Reload the page in your browser. The AI will immediately re-read your updated coreContent.ts and facet it based on a fresh context.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
