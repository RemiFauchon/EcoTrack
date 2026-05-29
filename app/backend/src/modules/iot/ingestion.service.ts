import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';
import { MeasurementsService } from '../measurements/measurements.service';

/**
 * Consommateur MQTT : reçoit les trames des capteurs et les enregistre
 * (validation + mise à jour de l'état + alertes) via MeasurementsService.
 */
@Injectable()
export class IngestionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(IngestionService.name);
  private client?: mqtt.MqttClient;

  constructor(
    private readonly config: ConfigService,
    private readonly measurements: MeasurementsService,
  ) {}

  onModuleInit() {
    const url = this.config.get<string>('mqtt.url')!;
    const topic = this.config.get<string>('mqtt.topic')!;
    this.client = mqtt.connect(url, { reconnectPeriod: 5000 });

    this.client.on('connect', () => {
      this.logger.log(`Connecté au broker MQTT (${url})`);
      this.client!.subscribe(topic, (err) => {
        if (err) this.logger.error(`Abonnement échoué: ${err.message}`);
        else this.logger.log(`Abonné au topic "${topic}"`);
      });
    });

    this.client.on('message', async (_topic, payload) => {
      try {
        const data = JSON.parse(payload.toString());
        await this.measurements.record({
          containerId: data.containerId,
          fillLevel: data.fillLevel,
          temperature: data.temperature,
          battery: data.battery,
          recordedAt: data.recordedAt,
        });
      } catch (e) {
        this.logger.warn(`Trame IoT invalide ignorée: ${(e as Error).message}`);
      }
    });

    this.client.on('error', (e) => this.logger.error(`MQTT: ${e.message}`));
  }

  onModuleDestroy() {
    this.client?.end(true);
  }
}
