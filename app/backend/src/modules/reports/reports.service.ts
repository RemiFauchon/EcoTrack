import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { ContainersService } from '../containers/containers.service';
import { AlertsService } from '../alerts/alerts.service';
import { SignalementsService } from '../signalements/signalements.service';
import { Alert } from '../alerts/alert.entity';
import { Signalement } from '../signalements/signalement.entity';
import { CollectionRoute } from '../routes/route.entity';
import { Measurement } from '../measurements/measurement.entity';
import { ContainerStatus, RouteStatus } from '../../common/enums/domain.enums';

@Injectable()
export class ReportsService {
  constructor(
    private readonly containers: ContainersService,
    private readonly alerts: AlertsService,
    private readonly signalements: SignalementsService,
    @InjectRepository(Alert) private readonly alertRepo: Repository<Alert>,
    @InjectRepository(Signalement) private readonly signalRepo: Repository<Signalement>,
    @InjectRepository(CollectionRoute) private readonly routeRepo: Repository<CollectionRoute>,
    @InjectRepository(Measurement) private readonly measureRepo: Repository<Measurement>,
  ) {}

  /** KPIs synthétiques pour le tableau de bord gestionnaire. */
  async overview() {
    const containers = await this.containers.findAll();
    const byStatus = { OK: 0, WARNING: 0, CRITICAL: 0, UNKNOWN: 0 } as Record<ContainerStatus, number>;
    let fillSum = 0;
    for (const c of containers) {
      byStatus[c.status] = (byStatus[c.status] ?? 0) + 1;
      fillSum += c.currentFillLevel;
    }
    const total = containers.length;
    return {
      totalContainers: total,
      byStatus,
      averageFillLevel: total ? Math.round(fillSum / total) : 0,
      toCollect: byStatus.WARNING + byStatus.CRITICAL,
      openAlerts: await this.alerts.countOpen(),
      newSignalements: await this.signalements.countNew(),
      generatedAt: new Date().toISOString(),
    };
  }

  /** Rapport mensuel (UC-G03). `month` au format YYYY-MM ; défaut = mois courant. */
  async monthly(month?: string) {
    const ref = month ? new Date(`${month}-01T00:00:00`) : new Date();
    const start = new Date(ref.getFullYear(), ref.getMonth(), 1);
    const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 1);
    const period = Between(start, end);

    const [alertsRaised, signalements, routes, measurements] = await Promise.all([
      this.alertRepo.count({ where: { createdAt: period } }),
      this.signalRepo.count({ where: { createdAt: period } }),
      this.routeRepo.find({ where: { createdAt: period } }),
      this.measureRepo.count({ where: { createdAt: period } }),
    ]);

    const completed = routes.filter((r) => r.status === RouteStatus.COMPLETED);
    const distanceKm = routes.reduce((s, r) => s + r.totalDistanceMeters, 0) / 1000;
    const stopsCollected = routes.reduce(
      (s, r) => s + r.stops.filter((x) => x.collected).length,
      0,
    );

    return {
      period: start.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      from: start.toISOString().slice(0, 10),
      to: end.toISOString().slice(0, 10),
      routesPlanned: routes.length,
      routesCompleted: completed.length,
      stopsCollected,
      distanceKm: Math.round(distanceKm * 10) / 10,
      alertsRaised,
      signalements,
      measurements,
      generatedAt: new Date().toISOString(),
    };
  }
}
