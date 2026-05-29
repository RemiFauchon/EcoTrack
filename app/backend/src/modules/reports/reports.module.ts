import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ContainersModule } from '../containers/containers.module';
import { AlertsModule } from '../alerts/alerts.module';
import { SignalementsModule } from '../signalements/signalements.module';
import { Alert } from '../alerts/alert.entity';
import { Signalement } from '../signalements/signalement.entity';
import { CollectionRoute } from '../routes/route.entity';
import { Measurement } from '../measurements/measurement.entity';

@Module({
  imports: [
    ContainersModule,
    AlertsModule,
    SignalementsModule,
    TypeOrmModule.forFeature([Alert, Signalement, CollectionRoute, Measurement]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
