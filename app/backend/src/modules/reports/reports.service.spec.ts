import { ReportsService } from './reports.service';
import { ContainerStatus, RouteStatus } from '../../common/enums/domain.enums';

describe('ReportsService', () => {
  it('agrège les KPIs du tableau de bord', async () => {
    const containers: any = {
      findAll: jest.fn().mockResolvedValue([
        { status: ContainerStatus.OK, currentFillLevel: 50 },
        { status: ContainerStatus.CRITICAL, currentFillLevel: 95 },
        { status: ContainerStatus.WARNING, currentFillLevel: 75 },
      ]),
    };
    const alerts: any = { countOpen: jest.fn().mockResolvedValue(4) };
    const signalements: any = { countNew: jest.fn().mockResolvedValue(2) };
    const service = new ReportsService(containers, alerts, signalements, {} as any, {} as any, {} as any, {} as any);
    const o = await service.overview();
    expect(o.totalContainers).toBe(3);
    expect(o.byStatus.CRITICAL).toBe(1);
    expect(o.toCollect).toBe(2); // WARNING + CRITICAL
    expect(o.openAlerts).toBe(4);
    expect(o.averageFillLevel).toBe(73); // (50+95+75)/3 = 73.3 -> 73
  });

  it('produit un rapport mensuel agrégé', async () => {
    const alertRepo: any = { count: jest.fn().mockResolvedValue(5) };
    const signalRepo: any = { count: jest.fn().mockResolvedValue(2) };
    const routeRepo: any = {
      find: jest.fn().mockResolvedValue([
        { status: RouteStatus.COMPLETED, totalDistanceMeters: 1000, stops: [{ collected: true }, { collected: false }] },
      ]),
    };
    const measureRepo: any = { count: jest.fn().mockResolvedValue(100) };
    const service = new ReportsService({} as any, {} as any, {} as any, alertRepo, signalRepo, routeRepo, measureRepo);
    const r = await service.monthly('2026-05');
    expect(r.routesCompleted).toBe(1);
    expect(r.stopsCollected).toBe(1);
    expect(r.distanceKm).toBe(1);
    expect(r.alertsRaised).toBe(5);
  });
});
