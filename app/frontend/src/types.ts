export type Role = 'CITOYEN' | 'AGENT' | 'GESTIONNAIRE' | 'ADMIN';
export type ContainerStatus = 'OK' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  points: number;
  mfaEnabled?: boolean;
}

export interface Container {
  id: string;
  code: string;
  address: string;
  capacityLiters: number;
  lat: number;
  lng: number;
  zoneId: string | null;
  currentFillLevel: number;
  status: ContainerStatus;
  lastMeasurementAt: string | null;
}

export interface Alert {
  id: string;
  containerId: string;
  type: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  message: string;
  createdAt: string;
}

export interface RouteStop {
  order: number;
  containerId: string;
  code: string;
  lat: number;
  lng: number;
  fillLevel: number;
  collected?: boolean;
  collectedVolume?: number | null;
  collectedAt?: string | null;
}

export interface CollectionRoute {
  id: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  stops: RouteStop[];
  totalDistanceMeters: number;
  estimatedDurationMin: number;
  createdAt: string;
}

export interface Overview {
  totalContainers: number;
  byStatus: Record<ContainerStatus, number>;
  averageFillLevel: number;
  toCollect: number;
  openAlerts: number;
  newSignalements: number;
}

export interface GamificationProfile {
  points: number;
  badges: {
    code: string;
    label: string;
    icon: string;
    description: string;
    threshold: number;
    unlocked: boolean;
  }[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  points: number;
}

export interface Settings {
  defaultThresholdWarn: number;
  defaultThresholdCritical: number;
  emailAlerts: boolean;
  pushAlerts: boolean;
  smsAlerts: boolean;
}

export interface Signalement {
  id: string;
  type: string;
  description: string;
  status: 'NEW' | 'IN_REVIEW' | 'RESOLVED';
  lat: number;
  lng: number;
  createdAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  goal: number;
  current: number;
  rewardPoints: number;
  endsAt: string;
  completed: boolean;
  joined: boolean;
  myContribution: number;
}

export interface MonthlyReport {
  period: string;
  from: string;
  to: string;
  routesPlanned: number;
  routesCompleted: number;
  stopsCollected: number;
  distanceKm: number;
  alertsRaised: number;
  signalements: number;
  measurements: number;
}
