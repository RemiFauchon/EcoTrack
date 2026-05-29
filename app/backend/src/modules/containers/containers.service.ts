import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Container } from './container.entity';
import { CreateContainerDto } from './dto/create-container.dto';
import { ContainerStatus } from '../../common/enums/domain.enums';

export interface ContainerView {
  id: string;
  code: string;
  address: string;
  capacityLiters: number;
  lat: number;
  lng: number;
  zoneId: string | null;
  currentFillLevel: number;
  thresholdWarn: number;
  thresholdCritical: number;
  status: ContainerStatus;
  lastMeasurementAt: Date | null;
}

@Injectable()
export class ContainersService {
  constructor(
    @InjectRepository(Container)
    private readonly repo: Repository<Container>,
  ) {}

  /** Calcule l'état d'un conteneur à partir de son niveau de remplissage. */
  static computeStatus(fill: number, warn: number, critical: number): ContainerStatus {
    if (fill >= critical) return ContainerStatus.CRITICAL;
    if (fill >= warn) return ContainerStatus.WARNING;
    return ContainerStatus.OK;
  }

  static toView(c: Container): ContainerView {
    const coords = (c.location as any)?.coordinates ?? [0, 0]; // [lng, lat]
    return {
      id: c.id,
      code: c.code,
      address: c.address,
      capacityLiters: c.capacityLiters,
      lng: coords[0],
      lat: coords[1],
      zoneId: c.zoneId,
      currentFillLevel: c.currentFillLevel,
      thresholdWarn: c.thresholdWarn,
      thresholdCritical: c.thresholdCritical,
      status: c.status,
      lastMeasurementAt: c.lastMeasurementAt,
    };
  }

  async findAll(filter?: { zoneId?: string; status?: ContainerStatus }): Promise<ContainerView[]> {
    const qb = this.repo.createQueryBuilder('c');
    if (filter?.zoneId) qb.andWhere('c.zoneId = :zoneId', { zoneId: filter.zoneId });
    if (filter?.status) qb.andWhere('c.status = :status', { status: filter.status });
    qb.orderBy('c.code', 'ASC');
    const rows = await qb.getMany();
    return rows.map(ContainersService.toView);
  }

  async findEntity(id: string): Promise<Container> {
    const c = await this.repo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Conteneur introuvable.');
    return c;
  }

  async findOne(id: string): Promise<ContainerView> {
    return ContainersService.toView(await this.findEntity(id));
  }

  async findByCode(code: string): Promise<Container | null> {
    return this.repo.findOne({ where: { code } });
  }

  async create(dto: CreateContainerDto): Promise<ContainerView> {
    const container = this.repo.create({
      code: dto.code,
      address: dto.address ?? '',
      capacityLiters: dto.capacityLiters ?? 1000,
      location: { type: 'Point', coordinates: [dto.lng, dto.lat] },
      zoneId: dto.zoneId ?? null,
      thresholdWarn: dto.thresholdWarn ?? 70,
      thresholdCritical: dto.thresholdCritical ?? 90,
      status: ContainerStatus.UNKNOWN,
    });
    return ContainersService.toView(await this.repo.save(container));
  }

  /** Met à jour l'état d'un conteneur après une nouvelle mesure. */
  async applyMeasurement(
    container: Container,
    fillLevel: number,
    recordedAt: Date,
  ): Promise<Container> {
    container.currentFillLevel = fillLevel;
    container.status = ContainersService.computeStatus(
      fillLevel,
      container.thresholdWarn,
      container.thresholdCritical,
    );
    container.lastMeasurementAt = recordedAt;
    return this.repo.save(container);
  }

  /** Conteneurs situés dans un rayon (mètres) — requête spatiale PostGIS. */
  async nearby(lat: number, lng: number, radiusMeters: number): Promise<ContainerView[]> {
    const rows = await this.repo
      .createQueryBuilder('c')
      .where(
        `ST_DWithin(c.location::geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radius)`,
        { lat, lng, radius: radiusMeters },
      )
      .getMany();
    return rows.map(ContainersService.toView);
  }

  /**
   * Conteneurs à collecter, pour l'optimisation de tournée.
   * Si `minFill` est fourni (UC-G01, seuil paramétrable), on filtre sur le niveau
   * de remplissage ; sinon on retombe sur les états WARNING/CRITICAL.
   */
  async toCollect(zoneId?: string, minFill?: number): Promise<Container[]> {
    const qb = this.repo.createQueryBuilder('c');
    if (minFill !== undefined && minFill !== null) {
      qb.where('c.currentFillLevel >= :minFill', { minFill });
    } else {
      qb.where('c.status IN (:...statuses)', {
        statuses: [ContainerStatus.WARNING, ContainerStatus.CRITICAL],
      });
    }
    if (zoneId) qb.andWhere('c.zoneId = :zoneId', { zoneId });
    return qb.getMany();
  }

  /** Met à jour les seuils d'alerte d'un conteneur (UC-AD02) et recalcule l'état. */
  async updateThresholds(id: string, warn: number, critical: number): Promise<ContainerView> {
    const c = await this.findEntity(id);
    c.thresholdWarn = warn;
    c.thresholdCritical = critical;
    c.status = ContainersService.computeStatus(c.currentFillLevel, warn, critical);
    return ContainersService.toView(await this.repo.save(c));
  }

  count(): Promise<number> {
    return this.repo.count();
  }
}
