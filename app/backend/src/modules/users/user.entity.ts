import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../common/enums/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  email: string;

  @Column({ select: false })
  passwordHash: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'enum', enum: Role, default: Role.CITOYEN })
  role: Role;

  /** Points de gamification cumulés (citoyens). */
  @Column({ type: 'int', default: 0 })
  points: number;

  /** Hash du refresh token courant (rotation des sessions). */
  @Column({ type: 'varchar', nullable: true, select: false })
  refreshTokenHash: string | null;

  /** Secret TOTP (MFA) — chiffré côté app idéalement ; ici stocké hors des lectures par défaut. */
  @Column({ type: 'varchar', nullable: true, select: false })
  mfaSecret: string | null;

  /** MFA activée (obligatoire pour GESTIONNAIRE/ADMIN selon le CDC). */
  @Column({ default: false })
  mfaEnabled: boolean;

  /** Tentatives de connexion échouées consécutives. */
  @Column({ type: 'int', default: 0 })
  failedLoginAttempts: number;

  /** Compte verrouillé jusqu'à cette date (après 5 échecs). */
  @Column({ type: 'timestamptz', nullable: true })
  lockedUntil: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
