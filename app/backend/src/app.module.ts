import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { HealthController } from './health.controller';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ZonesModule } from './modules/zones/zones.module';
import { ContainersModule } from './modules/containers/containers.module';
import { MeasurementsModule } from './modules/measurements/measurements.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { RoutesModule } from './modules/routes/routes.module';
import { IotModule } from './modules/iot/iot.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { SignalementsModule } from './modules/signalements/signalements.module';
import { ChallengesModule } from './modules/challenges/challenges.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SettingsModule } from './modules/settings/settings.module';
import { SeedModule } from './modules/seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),

    // Base de données PostgreSQL + PostGIS
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.user'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.name'),
        autoLoadEntities: true,
        // Synchronisation pilotée par configuration (DB_SYNCHRONIZE) :
        // auto en dev ; activable en prod pour la démo VPS, sinon migrations.
        synchronize: config.get<boolean>('database.synchronize'),
      }),
    }),

    // Rate limiting : 100 requêtes / minute / IP (cf. NFR du cahier des charges)
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    UsersModule,
    AuthModule,
    RealtimeModule,
    ZonesModule,
    ContainersModule,
    AlertsModule,
    MeasurementsModule,
    RoutesModule,
    GamificationModule,
    SignalementsModule,
    ChallengesModule,
    ReportsModule,
    SettingsModule,
    IotModule,
    SeedModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
