import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SignalementStatus } from '../../common/enums/domain.enums';

/** Signalement citoyen (conteneur plein, dépôt sauvage, conteneur endommagé…). */
@Entity('signalements')
export class Signalement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  citizenId: string;

  @Column({ type: 'uuid', nullable: true })
  containerId: string | null;

  @Column()
  type: string; // CONTENEUR_PLEIN | DEPOT_SAUVAGE | CONTENEUR_ENDOMMAGE

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  photoUrl: string | null;

  @Column({ type: 'double precision' })
  lat: number;

  @Column({ type: 'double precision' })
  lng: number;

  @Column({ type: 'enum', enum: SignalementStatus, default: SignalementStatus.NEW })
  status: SignalementStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;
}
