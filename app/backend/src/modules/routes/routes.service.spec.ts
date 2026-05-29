import { BadRequestException } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { ContainerStatus, RouteStatus } from '../../common/enums/domain.enums';

function container(id: string, lat: number, lng: number) {
  return {
    id,
    code: 'CT-' + id,
    location: { type: 'Point', coordinates: [lng, lat] },
    currentFillLevel: 80,
    status: ContainerStatus.WARNING,
    thresholdWarn: 70,
    thresholdCritical: 90,
    address: '',
    capacityLiters: 1000,
    zoneId: null,
    lastMeasurementAt: null,
  };
}

describe('RoutesService', () => {
  it('refuse l’optimisation sans conteneur à collecter', async () => {
    const containers: any = { toCollect: jest.fn().mockResolvedValue([]) };
    const service = new RoutesService({} as any, containers, {} as any, {} as any);
    await expect(service.optimize({})).rejects.toBeInstanceOf(BadRequestException);
  });

  it('construit une tournée ordonnée et la sauvegarde', async () => {
    const containers: any = {
      toCollect: jest.fn().mockResolvedValue([
        container('1', 45.77, 4.83),
        container('2', 45.75, 4.85),
        container('3', 45.76, 4.84),
      ]),
    };
    const repo: any = { create: (x: any) => x, save: jest.fn().mockImplementation(async (r) => ({ id: 'r1', ...r })) };
    const realtime: any = { emitRoutePlanned: jest.fn() };
    const service = new RoutesService(repo, containers, {} as any, realtime);
    const route = await service.optimize({ minFillLevel: 70 });
    expect(route.stops).toHaveLength(3);
    expect(route.stops[0].order).toBe(1);
    expect(route.totalDistanceMeters).toBeGreaterThan(0);
    expect(realtime.emitRoutePlanned).toHaveBeenCalled();
  });

  it('valide un arrêt et clôt la tournée quand tout est collecté', async () => {
    const route: any = {
      id: 'r1',
      status: RouteStatus.PLANNED,
      stops: [{ order: 1, containerId: 'c1', code: 'CT-c1', lat: 45.7, lng: 4.8, fillLevel: 80 }],
    };
    const repo: any = {
      findOne: jest.fn().mockResolvedValue(route),
      save: jest.fn().mockImplementation(async (r) => r),
    };
    const measurements: any = { record: jest.fn().mockResolvedValue({}) };
    const service = new RoutesService(repo, {} as any, measurements, {} as any);
    const updated = await service.collectStop('r1', 'c1', { volumeLiters: 400 });
    expect(measurements.record).toHaveBeenCalledWith({ containerId: 'c1', fillLevel: 3 });
    expect(updated.stops[0].collected).toBe(true);
    expect(updated.status).toBe(RouteStatus.COMPLETED);
  });
});
