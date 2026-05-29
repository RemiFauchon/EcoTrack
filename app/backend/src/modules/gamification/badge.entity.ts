import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Catalogue des badges débloquables (palier de points). */
@Entity('badges')
export class Badge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  label: string;

  @Column({ default: '' })
  description: string;

  @Column({ default: '🏅' })
  icon: string;

  /** Seuil de points à atteindre pour débloquer le badge. */
  @Column({ type: 'int' })
  threshold: number;
}
