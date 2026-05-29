import { MeasurementsService } from './measurements.service';
import { AlertType, ContainerStatus } from '../../common/enums/domain.enums';

describe('MeasurementsService', () => {
  it('enregistre une mesure et lève une alerte critique', async () => {
    const baseContainer = {
      id: 'c1',
      code: 'CT-1',
      location: { type: 'Point', coordinates: [4.8, 45.7] },
      thresholdWarn: 70,
      thresholdCritical: 90,
    };
    const repo: any = { create: (x: any) => x, save: jest.fn().mockImplementation(async (m) => ({ id: 'm1', ...m })) };
    const containers: any = {
      findEntity: jest.fn().mockResolvedValue(baseContainer),
      applyMeasurement: jest.fn().mockResolvedValue({
        ...baseContainer,
        currentFillLevel: 95,
        status: ContainerStatus.CRITICAL,
      }),
    };
    const alerts: any = { raise: jest.fn().mockResolvedValue({ id: 'a1' }), resolveOpenForContainer: jest.fn() };
    const realtime: any = { emitContainerUpdate: jest.fn(), emitAlert: jest.fn() };

    const service = new MeasurementsService(repo, containers, alerts, realtime);
    await service.record({ containerId: 'c1', fillLevel: 95 });

    expect(repo.save).toHaveBeenCalled();
    expect(alerts.raise).toHaveBeenCalledWith('c1', AlertType.OVERFLOW_IMMINENT, expect.anything(), expect.any(String));
    expect(realtime.emitContainerUpdate).toHaveBeenCalled();
    expect(realtime.emitAlert).toHaveBeenCalled();
  });

  it('résout les alertes quand le conteneur revient à OK', async () => {
    const baseContainer = {
      id: 'c1',
      code: 'CT-1',
      location: { type: 'Point', coordinates: [4.8, 45.7] },
      thresholdWarn: 70,
      thresholdCritical: 90,
    };
    const repo: any = { create: (x: any) => x, save: jest.fn().mockResolvedValue({ id: 'm1' }) };
    const containers: any = {
      findEntity: jest.fn().mockResolvedValue(baseContainer),
      applyMeasurement: jest.fn().mockResolvedValue({ ...baseContainer, currentFillLevel: 5, status: ContainerStatus.OK }),
    };
    const alerts: any = { raise: jest.fn(), resolveOpenForContainer: jest.fn().mockResolvedValue(undefined) };
    const realtime: any = { emitContainerUpdate: jest.fn(), emitAlert: jest.fn() };

    const service = new MeasurementsService(repo, containers, alerts, realtime);
    await service.record({ containerId: 'c1', fillLevel: 5 });
    expect(alerts.resolveOpenForContainer).toHaveBeenCalledWith('c1');
  });
});
