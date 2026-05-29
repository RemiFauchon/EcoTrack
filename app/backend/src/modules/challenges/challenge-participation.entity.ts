import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/** Participation d'un citoyen à un défi collectif. */
@Entity('challenge_participations')
@Index(['challengeId', 'userId'], { unique: true })
export class ChallengeParticipation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  challengeId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'int', default: 0 })
  contribution: number;

  @Column({ default: false })
  rewarded: boolean;

  @CreateDateColumn()
  joinedAt: Date;
}
