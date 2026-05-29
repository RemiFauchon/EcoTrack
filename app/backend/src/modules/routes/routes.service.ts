import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollectionRoute, RouteStop } from './route.entity';
import { OptimizeRouteDto } from './dto/optimize-route.dto';
import { ContainersService } from '../containers/containers.service';
import { MeasurementsService } from '../measurements/measurements.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { optimizeRoute, GeoPoint } from '../../common/tsp/tsp.util';
import { RouteStatus } from '../../common/enums/domain.enums';

/** Dépôt de la flotte (centre de Lyon pour la démo). */
const DEPOT: GeoPoint = { lat: 45.764, lng: 4.8357 };
const AVG_SPEED_KMH = 20; // collecte urbaine
const SERVICE_MIN_PER_STOP = 3;

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(CollectionRoute)
    private readonly repo: Repository<CollectionRoute>,
    private readonly containers: ContainersService,
    private readonly measurements: MeasurementsService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async optimize(dto: OptimizeRouteDto): Promise<CollectionRoute> {
    const toCollect = await this.containers.toCollect(dto.zoneId, dto.minFillLevel);
    if (toCollect.length === 0) {
      throw new BadRequestException('Aucun conteneur à collecter pour ce périmètre.');
    }

    const views = toCollect.map((c) => ContainersService.toView(c));
    const points: GeoPoint[] = views.map((v) => ({ lat: v.lat, lng: v.lng }));
    const { order, distanceMeters } = optimizeRoute(DEPOT, points);

    const stops: RouteStop[] = order.map((idx, i) => ({
      order: i + 1,
      containerId: views[idx].id,
      code: views[idx].code,
      lat: views[idx].lat,
      lng: views[idx].lng,
      fillLevel: views[idx].currentFillLevel,
    }));

    const drivingMin = (distanceMeters / 1000 / AVG_SPEED_KMH) * 60;
    const estimatedDurationMin = Math.round(drivingMin + stops.length * SERVICE_MIN_PER_STOP);

    const route = await this.repo.save(
      this.repo.create({
        status: RouteStatus.PLANNED,
        zoneId: dto.zoneId ?? null,
        agentId: dto.agentId ?? null,
        scheduledFor: dto.scheduledFor ?? null,
        stops,
        totalDistanceMeters: distanceMeters,
        estimatedDurationMin,
      }),
    );

    this.realtime.emitRoutePlanned(route);
    return route;
  }

  findAll(filter?: { agentId?: string; status?: RouteStatus }): Promise<CollectionRoute[]> {
    const where: Record<string, unknown> = {};
    if (filter?.agentId) where.agentId = filter.agentId;
    if (filter?.status) where.status = filter.status;
    return this.repo.find({ where, order: { createdAt: 'DESC' }, take: 100 });
  }

  async findOne(id: string): Promise<CollectionRoute> {
    const route = await this.repo.findOne({ where: { id } });
    if (!route) throw new NotFoundException('Tournée introuvable.');
    return route;
  }

  async updateStatus(id: string, status: RouteStatus): Promise<CollectionRoute> {
    const route = await this.findOne(id);
    route.status = status;
    return this.repo.save(route);
  }

  /**
   * UC-A02 : valide la collecte d'un arrêt (scan QR → containerId).
   * Enregistre le volume + position, vide le conteneur (mesure ~3 % → état OK,
   * alertes résolues, mise à jour temps réel) et clôt la tournée si tout est collecté.
   */
  async collectStop(
    routeId: string,
    containerId: string,
    data: { volumeLiters?: number; lat?: number; lng?: number },
  ): Promise<CollectionRoute> {
    const route = await this.findOne(routeId);
    const stop = route.stops.find((s) => s.containerId === containerId);
    if (!stop) throw new NotFoundException("Cet arrêt n'appartient pas à la tournée.");

    stop.collected = true;
    stop.collectedVolume = data.volumeLiters ?? null;
    stop.collectedAt = new Date().toISOString();

    // Conteneur vidé → mesure basse via le pipeline (résout les alertes, push temps réel)
    await this.measurements.record({ containerId, fillLevel: 3 });

    if (route.status === RouteStatus.PLANNED) route.status = RouteStatus.IN_PROGRESS;
    if (route.stops.every((s) => s.collected)) route.status = RouteStatus.COMPLETED;

    // jsonb : forcer la détection du changement
    route.stops = [...route.stops];
    return this.repo.save(route);
  }
}
