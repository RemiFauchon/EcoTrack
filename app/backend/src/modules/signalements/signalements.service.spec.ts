import { SignalementsService } from './signalements.service';
import { SignalementStatus } from '../../common/enums/domain.enums';

function setup() {
  const repo: any = {
    create: (x: any) => x,
    save: jest.fn().mockImplementation(async (s) => ({ id: 's1', ...s })),
    findOne: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  };
  const gamification: any = { awardPoints: jest.fn().mockResolvedValue(undefined) };
  const challenges: any = { registerContribution: jest.fn().mockResolvedValue(undefined) };
  const realtime: any = { emitSignalement: jest.fn() };
  return { service: new SignalementsService(repo, gamification, challenges, realtime), repo, gamification, challenges, realtime };
}

describe('SignalementsService', () => {
  it('citoyen : crédite 10 points + contribue aux défis + temps réel', async () => {
    const { service, gamification, challenges, realtime } = setup();
    await service.create('u1', { type: 'CONTENEUR_PLEIN', lat: 45.7, lng: 4.8 } as any, true);
    expect(gamification.awardPoints).toHaveBeenCalledWith('u1', 10);
    expect(challenges.registerContribution).toHaveBeenCalledWith('u1');
    expect(realtime.emitSignalement).toHaveBeenCalled();
  });

  it('agent : anomalie sans points ni contribution', async () => {
    const { service, gamification, challenges } = setup();
    await service.create('agent1', { type: 'CONTENEUR_ENDOMMAGE', lat: 45.7, lng: 4.8 } as any, false);
    expect(gamification.awardPoints).not.toHaveBeenCalled();
    expect(challenges.registerContribution).not.toHaveBeenCalled();
  });

  it('résout un signalement', async () => {
    const { service, repo } = setup();
    repo.findOne.mockResolvedValue({ id: 's1', status: SignalementStatus.NEW, resolvedAt: null });
    repo.save.mockImplementation(async (s: any) => s);
    const res = await service.resolve('s1');
    expect(res.status).toBe(SignalementStatus.RESOLVED);
    expect(res.resolvedAt).toBeInstanceOf(Date);
  });
});
