import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Zone } from '../zones/zone.entity';
import { Container } from '../containers/container.entity';
import { SeedService } from './seed.service';
import { UsersModule } from '../users/users.module';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Zone, Container]), UsersModule, GamificationModule],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
