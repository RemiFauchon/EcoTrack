import { ChallengesService } from './challenges.service';

describe('ChallengesService', () => {
  it('rejoint un défi sans créer de doublon', async () => {
    const challenges: any = { findOne: jest.fn().mockResolvedValue({ id: 'c1' }) };
    const parts: any = {
      findOne: jest.fn().mockResolvedValue(null),
      create: (x: any) => x,
      save: jest.fn().mockResolvedValue({}),
    };
    const service = new ChallengesService(challenges, parts, {} as any);
    await service.join('u1', 'c1');
    expect(parts.save).toHaveBeenCalled();
  });

  it('ne rejoint pas deux fois', async () => {
    const challenges: any = { findOne: jest.fn().mockResolvedValue({ id: 'c1' }) };
    const parts: any = { findOne: jest.fn().mockResolvedValue({ id: 'p1' }), save: jest.fn() };
    const service = new ChallengesService(challenges, parts, {} as any);
    await service.join('u1', 'c1');
    expect(parts.save).not.toHaveBeenCalled();
  });

  it('comptabilise une contribution et récompense à l’objectif atteint', async () => {
    const challenge = { id: 'c1', goal: 1, current: 0, completed: false, rewardPoints: 50 };
    const challenges: any = {
      find: jest.fn().mockResolvedValue([challenge]),
      save: jest.fn().mockImplementation(async (c) => c),
    };
    const participant = { userId: 'u1', challengeId: 'c1', contribution: 0, rewarded: false };
    const parts: any = {
      findOne: jest.fn().mockResolvedValue(participant),
      find: jest.fn().mockResolvedValue([participant]),
      save: jest.fn().mockImplementation(async (p) => p),
    };
    const gamification: any = { awardPoints: jest.fn().mockResolvedValue(undefined) };
    const service = new ChallengesService(challenges, parts, gamification);
    await service.registerContribution('u1');
    expect(challenge.current).toBe(1);
    expect(challenge.completed).toBe(true);
    expect(gamification.awardPoints).toHaveBeenCalledWith('u1', 50);
  });
});
