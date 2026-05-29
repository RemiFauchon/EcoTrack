import { ZonesService } from './zones.service';

describe('ZonesService', () => {
  it('liste les zones triées par code', async () => {
    const rows = [{ id: 'z1', code: 'SECTEUR-01' }];
    const repo: any = { find: jest.fn().mockResolvedValue(rows), findOne: jest.fn() };
    const service = new ZonesService(repo);
    expect(await service.findAll()).toBe(rows);
    expect(repo.find).toHaveBeenCalledWith({ order: { code: 'ASC' } });
  });

  it('récupère une zone par id', async () => {
    const repo: any = { find: jest.fn(), findOne: jest.fn().mockResolvedValue({ id: 'z1' }) };
    const service = new ZonesService(repo);
    const z = await service.findOne('z1');
    expect(z!.id).toBe('z1');
  });
});
