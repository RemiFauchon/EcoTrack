import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { SimulatorService } from './simulator.service';
import { MeasurementsModule } from '../measurements/measurements.module';
import { ContainersModule } from '../containers/containers.module';

/**
 * Chaîne IoT : SimulatorService publie des mesures sur MQTT,
 * IngestionService les consomme et les enregistre.
 */
@Module({
  imports: [MeasurementsModule, ContainersModule],
  providers: [IngestionService, SimulatorService],
})
export class IotModule {}
