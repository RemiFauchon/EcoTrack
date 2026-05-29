import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Point } from 'geojson';
import { Zone } from '../zones/zone.entity';
import { ContainerStatus } from '../../common/enums/domain.enums';

/** Conteneur à déchets connecté (capteur ultrasonique). */
@Entity('containers')
export class Container {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  code: string; // identifiant / QR code

  @Column({ default: '' })
  address: string;

  @Column({ type: 'int', default: 1000 })
  capacityLiters: number;

  /** Position géographique (PostGIS, WGS84 / SRID 4326). */
  @Index({ spatial: true })
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: Point;

  @ManyToOne(() => Zone, (z) => z.containers, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'zoneId' })
  zone: Zone | null;

  @Column({ type: 'uuid', nullable: true })
  zoneId: string | null;

  /** Dernier niveau de remplissage connu (0-100 %). */
  @Column({ type: 'int', default: 0 })
  currentFillLevel: number;

  @Column({ type: 'int', default: 70 })
  thresholdWarn: number;

  @Column({ type: 'int', default: 90 })
  thresholdCritical: number;

  @Column({ type: 'enum', enum: ContainerStatus, default: ContainerStatus.UNKNOWN })
  status: ContainerStatus;

  @Column({ type: 'timestamptz', nullable: true })
  lastMeasurementAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
