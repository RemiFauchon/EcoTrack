import { AlertsService } from './alerts.service';
import { AlertSeverity, AlertStatus, AlertType } from '../../common/enums/domain.enums';

describe('AlertsService', () => {
  it('ne crée pas de doublon si une alerte ouverte du même type existe', async () => {
    const repo: any = {
      findOne: jest.fn().mockResolvedValue({ id: 'existing' }),
      create: jest.fn(),
      save: jest.fn(),
    };
    const service = new AlertsService(repo);
    const res = await service.raise('c1', AlertType.OVERFLOW_IMMINENT, AlertSeverity.CRITICAL, 'msg');
    expect(res).toBeNull();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('crée une alerte si aucune ouverte du même type', async () => {
    const repo: any = {
      findOne: jest.fn().mockResolvedValue(null),
      create: (x: any) => x,
      save: jest.fn().mockImplementation(async (a) => ({ id: 'new', ...a })),
    };
    const service = new AlertsService(repo);
    const res = await service.raise('c1', AlertType.TO_COLLECT, AlertSeverity.WARNING, 'msg');
    expect(res).not.toBeNull();
    expect(repo.save).toHaveBeenCalled();
  });

  it('résout une alerte (statut + date)', async () => {
    const alert: any = { id: 'a1', status: AlertStatus.OPEN, resolvedAt: null };
    const repo: any = {
      findOne: jest.fn().mockResolvedValue(alert),
      save: jest.fn().mockImplementation(async (a) => a),
    };
    const service = new AlertsService(repo);
    const res = await service.resolve('a1');
    expect(res.status).toBe(AlertStatus.RESOLVED);
    expect(res.resolvedAt).toBeInstanceOf(Date);
  });

  it('compte les alertes ouvertes', async () => {
    const repo: any = { count: jest.fn().mockResolvedValue(7) };
    const service = new AlertsService(repo);
    expect(await service.countOpen()).toBe(7);
  });
});
