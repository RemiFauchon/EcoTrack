import { ContainersService } from './containers.service';
import { ContainerStatus } from '../../common/enums/domain.enums';

function makeQbMock(result: any[]) {
  const qb: any = {
    where: () => qb,
    andWhere: () => qb,
    orderBy: () => qb,
    getMany: async () => result,
  };
  return qb;
}

describe('ContainersService', () => {
  describe('computeStatus', () => {
    it('OK sous le seuil warning', () => {
      expect(ContainersService.computeStatus(50, 70, 90)).toBe(ContainerStatus.OK);
    });
    it('WARNING au seuil warning', () => {
      expect(ContainersService.computeStatus(70, 70, 90)).toBe(ContainerStatus.WARNING);
    });
    it('CRITICAL au seuil critique', () => {
      expect(ContainersService.computeStatus(95, 70, 90)).toBe(ContainerStatus.CRITICAL);
    });
  });

  describe('toView', () => {
    it('mappe la géométrie PostGIS [lng,lat] vers lat/lng', () => {
      const view = ContainersService.toView({
        id: 'c1',
        code: 'CT-0001',
        address: 'Lyon',
        capacityLiters: 1000,
        location: { type: 'Point', coordinates: [4.8357, 45.764] },
        zoneId: 'z1',
        currentFillLevel: 80,
        thresholdWarn: 70,
        thresholdCritical: 90,
        status: ContainerStatus.WARNING,
        lastMeasurementAt: null,
      } as any);
      expect(view.lat).toBe(45.764);
      expect(view.lng).toBe(4.8357);
      expect(view.code).toBe('CT-0001');
    });
  });

  describe('create', () => {
    it('construit un Point WGS84 et sauvegarde', async () => {
      const saved = {
        id: 'c1',
        code: 'CT-1',
        address: '',
        capacityLiters: 1000,
        location: { type: 'Point', coordinates: [4.8, 45.7] },
        zoneId: null,
        currentFillLevel: 0,
        thresholdWarn: 70,
        thresholdCritical: 90,
        status: ContainerStatus.UNKNOWN,
        lastMeasurementAt: null,
      };
      const repo: any = { create: (x: any) => x, save: jest.fn().mockResolvedValue(saved) };
      const service = new ContainersService(repo);
      const view = await service.create({ code: 'CT-1', lat: 45.7, lng: 4.8 } as any);
      expect(repo.save).toHaveBeenCalled();
      const arg = repo.save.mock.calls[0][0];
      expect(arg.location).toEqual({ type: 'Point', coordinates: [4.8, 45.7] });
      expect(view.lat).toBe(45.7);
    });
  });

  describe('toCollect', () => {
    it('renvoie les conteneurs filtrés (seuil)', async () => {
      const rows = [{ id: 'a' }, { id: 'b' }];
      const repo: any = { createQueryBuilder: () => makeQbMock(rows) };
      const service = new ContainersService(repo);
      const res = await service.toCollect(undefined, 70);
      expect(res).toHaveLength(2);
    });
  });

  describe('updateThresholds', () => {
    it('met à jour les seuils et recalcule le statut', async () => {
      const container = {
        id: 'c1',
        currentFillLevel: 85,
        thresholdWarn: 70,
        thresholdCritical: 90,
        location: { type: 'Point', coordinates: [4.8, 45.7] },
        status: ContainerStatus.WARNING,
      };
      const repo: any = {
        findOne: jest.fn().mockResolvedValue(container),
        save: jest.fn().mockImplementation(async (c) => c),
      };
      const service = new ContainersService(repo);
      const view = await service.updateThresholds('c1', 80, 95);
      expect(view.status).toBe(ContainerStatus.WARNING); // 85 >= 80 warn, < 95 crit
      expect(view.thresholdWarn).toBe(80);
    });
  });
});
