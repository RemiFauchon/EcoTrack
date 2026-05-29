import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Container } from '../containers/container.entity';

/**
 * Mesure remontée par un capteur IoT.
 * Table à fort volume (~500 000 lignes/jour en cible) — indexée par conteneur + date.
 */
@Entity('measurements')
@Index(['containerId', 'recordedAt'])
export class Measurement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Container, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'containerId' })
  container: Container;

  @Column({ type: 'uuid' })
  containerId: string;

  @Column({ type: 'int' })
  fillLevel: number; // 0-100 %

  @Column({ type: 'real', nullable: true })
  temperature: number | null;

  @Column({ type: 'int', nullable: true })
  battery: number | null; // 0-100 %

  @Column({ type: 'timestamptz' })
  recordedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
