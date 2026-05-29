import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RouteStatus } from '../../common/enums/domain.enums';

export interface RouteStop {
  order: number;
  containerId: string;
  code: string;
  lat: number;
  lng: number;
  fillLevel: number;
  collected?: boolean;
  collectedVolume?: number | null;
  collectedAt?: string | null;
}

/** Tournée de collecte optimisée. */
@Entity('routes')
export class CollectionRoute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: RouteStatus, default: RouteStatus.PLANNED })
  status: RouteStatus;

  @Column({ type: 'uuid', nullable: true })
  zoneId: string | null;

  @Column({ type: 'uuid', nullable: true })
  agentId: string | null;

  @Column({ type: 'date', nullable: true })
  scheduledFor: string | null;

  /** Étapes ordonnées de la tournée (issues de l'optimisation TSP). */
  @Column({ type: 'jsonb', default: () => "'[]'" })
  stops: RouteStop[];

  @Column({ type: 'int', default: 0 })
  totalDistanceMeters: number;

  @Column({ type: 'int', default: 0 })
  estimatedDurationMin: number;

  @CreateDateColumn()
  createdAt: Date;
}
