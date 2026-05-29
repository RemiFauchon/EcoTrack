import { Column, Entity, PrimaryColumn } from 'typeorm';

/** Paramètres globaux de la plateforme (ligne unique, UC-AD02). */
@Entity('settings')
export class Settings {
  @PrimaryColumn({ default: 'global' })
  id: string;

  @Column({ type: 'int', default: 70 })
  defaultThresholdWarn: number;

  @Column({ type: 'int', default: 90 })
  defaultThresholdCritical: number;

  @Column({ default: true })
  emailAlerts: boolean;

  @Column({ default: true })
  pushAlerts: boolean;

  @Column({ default: false })
  smsAlerts: boolean;
}
