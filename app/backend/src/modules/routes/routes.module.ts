import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionRoute } from './route.entity';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { ContainersModule } from '../containers/containers.module';
import { MeasurementsModule } from '../measurements/measurements.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CollectionRoute]),
    ContainersModule,
    MeasurementsModule,
    RealtimeModule,
  ],
  controllers: [RoutesController],
  providers: [RoutesService],
  exports: [RoutesService],
})
export class RoutesModule {}
