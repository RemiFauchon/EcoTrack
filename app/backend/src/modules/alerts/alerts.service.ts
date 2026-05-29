import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './alert.entity';
import {
  AlertSeverity,
  AlertStatus,
  AlertType,
} from '../../common/enums/domain.enums';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private readonly repo: Repository<Alert>,
  ) {}

  /**
   * Crée une alerte si aucune alerte OUVERTE du même type n'existe déjà
   * pour ce conteneur (déduplication). Renvoie l'alerte créée, ou null.
   */
  async raise(
    containerId: string,
    type: AlertType,
    severity: AlertSeverity,
    message: string,
  ): Promise<Alert | null> {
    const existing = await this.repo.findOne({
      where: { containerId, type, status: AlertStatus.OPEN },
    });
    if (existing) return null;
    const alert = this.repo.create({ containerId, type, severity, message });
    return this.repo.save(alert);
  }

  findAll(status?: AlertStatus): Promise<Alert[]> {
    const where = status ? { status } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' }, take: 200 });
  }

  async acknowledge(id: string): Promise<Alert> {
    const alert = await this.repo.findOne({ where: { id } });
    if (!alert) throw new NotFoundException('Alerte introuvable.');
    alert.status = AlertStatus.ACKNOWLEDGED;
    return this.repo.save(alert);
  }

  async resolve(id: string): Promise<Alert> {
    const alert = await this.repo.findOne({ where: { id } });
    if (!alert) throw new NotFoundException('Alerte introuvable.');
    alert.status = AlertStatus.RESOLVED;
    alert.resolvedAt = new Date();
    return this.repo.save(alert);
  }

  /** Résout automatiquement les alertes ouvertes d'un conteneur revenu à la normale. */
  async resolveOpenForContainer(containerId: string): Promise<void> {
    await this.repo.update(
      { containerId, status: AlertStatus.OPEN },
      { status: AlertStatus.RESOLVED, resolvedAt: new Date() },
    );
  }

  countOpen(): Promise<number> {
    return this.repo.count({ where: { status: AlertStatus.OPEN } });
  }
}
