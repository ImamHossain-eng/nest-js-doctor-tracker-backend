import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { SeedService } from './seed.service.js';

async function runSeed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedService);

  try {
    await seedService.seed();
    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    await app.close();
    process.exit(0);
  }
}

runSeed();
