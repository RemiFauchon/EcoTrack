import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Container } from '../containers/container.entity';

/** Secteur géographique de la métropole (12 secteurs dans ECOTRACK). */
@Entity('zones')
export class Zone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string; // ex. "SECTEUR-01"

  @Column()
  name: string;

  /** Centre approximatif du secteur (pour recadrer la carte). */
  @Column({ type: 'double precision', nullable: true })
  centerLat: number | null;

  @Column({ type: 'double precision', nullable: true })
  centerLng: number | null;

  @OneToMany(() => Container, (c) => c.zone)
  containers: Container[];

  @CreateDateColumn()
  createdAt: Date;
}
