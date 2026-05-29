import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';
import { ContainersService } from '../containers/containers.service';

/**
 * Simulateur de capteurs IoT : publie périodiquement des mesures de
 * remplissage sur le broker MQTT (le remplissage croît, puis chute après
 * collecte). Permet une démo « vivante » sans matériel réel.
 */
@Injectable()
export class SimulatorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SimulatorService.name);
  private client?: mqtt.MqttClient;
  private timer?: NodeJS.Timeout;
  private readonly levels = new Map<string, number>();

  constructor(
    private readonly config: ConfigService,
    private readonly containers: ContainersService,
  ) {}

  onModuleInit() {
    if (!this.config.get<boolean>('simulator.enabled')) {
      this.logger.log('Simulateur IoT désactivé.');
      return;
    }
    const url = this.config.get<string>('mqtt.url')!;
    const intervalMs = this.config.get<number>('simulator.intervalMs')!;
    this.client = mqtt.connect(url, { reconnectPeriod: 5000 });
    this.client.on('connect', () => this.logger.log('Simulateur IoT connecté au broker.'));
    // Démarrage différé : laisse le temps au seed de créer les conteneurs.
    setTimeout(() => {
      this.timer = setInterval(() => this.tick(), intervalMs);
    }, 8000);
  }

  private async tick() {
    if (!this.client?.connected) return;
    const topic = this.config.get<string>('mqtt.topic')!;
    const containers = await this.containers.findAll();
    if (containers.length === 0) return;

    for (const c of containers) {
      let level = this.levels.get(c.id) ?? c.currentFillLevel ?? 0;
      // Collecte simulée : au-delà de 92 %, ~30 % de chance de vidage.
      if (level >= 92 && Math.random() < 0.3) {
        level = Math.floor(Math.random() * 8);
      } else {
        level = Math.min(100, level + Math.floor(Math.random() * 9)); // +0 à +8 %
      }
      this.levels.set(c.id, level);

      const payload = JSON.stringify({
        containerId: c.id,
        fillLevel: level,
        temperature: +(10 + Math.random() * 20).toFixed(1),
        battery: 60 + Math.floor(Math.random() * 40),
        recordedAt: new Date().toISOString(),
      });
      this.client.publish(topic, payload);
    }
    this.logger.debug(`Mesures publiées pour ${containers.length} conteneurs.`);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
    this.client?.end(true);
  }
}
