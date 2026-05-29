import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Measurement } from './measurement.entity';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { ContainersService } from '../containers/containers.service';
import { AlertsService } from '../alerts/alerts.service';
import { Alert } from '../alerts/alert.entity';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import {
  AlertSeverity,
  AlertType,
  ContainerStatus,
} from '../../common/enums/domain.enums';

const BATTERY_LOW_THRESHOLD = 15;

@Injectable()
export class MeasurementsService {
  private readonly logger = new Logger(MeasurementsService.name);

  constructor(
    @InjectRepository(Measurement)
    private readonly repo: Repository<Measurement>,
    private readonly containers: ContainersService,
    private readonly alerts: AlertsService,
    private readonly realtime: RealtimeGateway,
  ) {}

  /**
   * Enregistre une mesure, met à jour l'état du conteneur, déclenche les
   * alertes pertinentes et pousse les mises à jour temps réel.
   */
  async record(dto: CreateMeasurementDto): Promise<Measurement> {
    const container = await this.containers.findEntity(dto.containerId);
    const recordedAt = dto.recordedAt ? new Date(dto.recordedAt) : new Date();

    const measurement = await this.repo.save(
      this.repo.create({
        containerId: container.id,
        fillLevel: dto.fillLevel,
        temperature: dto.temperature ?? null,
        battery: dto.battery ?? null,
        recordedAt,
      }),
    );

    const updated = await this.containers.applyMeasurement(
      container,
      dto.fillLevel,
      recordedAt,
    );

    // Gestion des alertes selon le nouvel état
    let raisedAlert: Alert | null = null;
    if (updated.status === ContainerStatus.CRITICAL) {
      raisedAlert = await this.alerts.raise(
        updated.id,
        AlertType.OVERFLOW_IMMINENT,
        AlertSeverity.CRITICAL,
        `Conteneur ${updated.code} à ${dto.fillLevel}% — débordement imminent.`,
      );
    } else if (updated.status === ContainerStatus.WARNING) {
      raisedAlert = await this.alerts.raise(
        updated.id,
        AlertType.TO_COLLECT,
        AlertSeverity.WARNING,
        `Conteneur ${updated.code} à ${dto.fillLevel}% — à planifier en collecte.`,
      );
    } else if (updated.status === ContainerStatus.OK) {
      await this.alerts.resolveOpenForContainer(updated.id);
    }

    if (dto.battery !== undefined && dto.battery <= BATTERY_LOW_THRESHOLD) {
      await this.alerts.raise(
        updated.id,
        AlertType.BATTERY_LOW,
        AlertSeverity.INFO,
        `Batterie faible (${dto.battery}%) sur le capteur du conteneur ${updated.code}.`,
      );
    }

    // Temps réel
    this.realtime.emitContainerUpdate(ContainersService.toView(updated));
    if (raisedAlert) this.realtime.emitAlert(raisedAlert);

    return measurement;
  }

  /** Historique des mesures d'un conteneur (les plus récentes d'abord). */
  history(containerId: string, limit = 100): Promise<Measurement[]> {
    return this.repo.find({
      where: { containerId },
      order: { recordedAt: 'DESC' },
      take: limit,
    });
  }
}
