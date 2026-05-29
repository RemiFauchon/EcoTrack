import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Défi collectif citoyen (UC-C03). */
@Entity('challenges')
export class Challenge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  title: string;

  @Column({ default: '' })
  description: string;

  /** Objectif collectif (nombre de signalements à atteindre). */
  @Column({ type: 'int' })
  goal: number;

  /** Progression collective courante. */
  @Column({ type: 'int', default: 0 })
  current: number;

  /** Points attribués à chaque participant si l'objectif est atteint. */
  @Column({ type: 'int', default: 50 })
  rewardPoints: number;

  @Column({ type: 'timestamptz' })
  startsAt: Date;

  @Column({ type: 'timestamptz' })
  endsAt: Date;

  @Column({ default: false })
  completed: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
