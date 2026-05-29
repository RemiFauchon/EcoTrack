import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  it('crée des paramètres par défaut si absents', async () => {
    const repo: any = {
      findOne: jest.fn().mockResolvedValue(null),
      create: (x: any) => x,
      save: jest.fn().mockImplementation(async (s) => s),
    };
    const service = new SettingsService(repo);
    const s = await service.get();
    expect(s.id).toBe('global');
    expect(repo.save).toHaveBeenCalled();
  });

  it('met à jour les paramètres existants', async () => {
    const current = { id: 'global', emailAlerts: true, pushAlerts: true, smsAlerts: false };
    const repo: any = {
      findOne: jest.fn().mockResolvedValue(current),
      save: jest.fn().mockImplementation(async (s) => s),
    };
    const service = new SettingsService(repo);
    const s = await service.update({ smsAlerts: true });
    expect(s.smsAlerts).toBe(true);
    expect(s.id).toBe('global');
  });
});
