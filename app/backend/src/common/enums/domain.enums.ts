/** État de remplissage d'un conteneur (dérivé de la dernière mesure). */
export enum ContainerStatus {
  OK = 'OK', // < seuil d'alerte
  WARNING = 'WARNING', // >= seuil warning (à collecter)
  CRITICAL = 'CRITICAL', // >= seuil critique (débordement imminent)
  UNKNOWN = 'UNKNOWN', // pas de mesure récente / capteur muet
}

export enum AlertType {
  OVERFLOW_IMMINENT = 'OVERFLOW_IMMINENT',
  TO_COLLECT = 'TO_COLLECT',
  SENSOR_SILENT = 'SENSOR_SILENT',
  BATTERY_LOW = 'BATTERY_LOW',
}

export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

export enum AlertStatus {
  OPEN = 'OPEN',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED',
}

export enum RouteStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum SignalementStatus {
  NEW = 'NEW',
  IN_REVIEW = 'IN_REVIEW',
  RESOLVED = 'RESOLVED',
}
