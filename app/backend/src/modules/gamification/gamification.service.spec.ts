import { GamificationService } from './gamification.service';

describe('GamificationService', () => {
  it('classe les citoyens par points décroissants', async () => {
    const users: any = {
      findAll: jest.fn().mockResolvedValue([
        { id: 'a', firstName: 'A', lastName: 'A', points: 10 },
        { id: 'b', firstName: 'B', lastName: 'B', points: 30 },
        { id: 'c', firstName: 'C', lastName: 'C', points: 20 },
      ]),
    };
    const service = new GamificationService({} as any, {} as any, users);
    const board = await service.leaderboard();
    expect(board[0].userId).toBe('b');
    expect(board[0].rank).toBe(1);
    expect(board[2].points).toBe(10);
  });

  it('attribue les points et débloque les badges atteints', async () => {
    const users: any = {
      addPoints: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn().mockResolvedValue({ id: 'u1', points: 60 }),
    };
    const badges: any = {
      find: jest.fn().mockResolvedValue([{ id: 'b1', label: 'Éco', threshold: 50 }]),
    };
    const userBadges: any = {
      findOne: jest.fn().mockResolvedValue(null),
      create: (x: any) => x,
      save: jest.fn().mockResolvedValue({}),
    };
    const service = new GamificationService(badges, userBadges, users);
    await service.awardPoints('u1', 10);
    expect(users.addPoints).toHaveBeenCalledWith('u1', 10);
    expect(userBadges.save).toHaveBeenCalled(); // badge débloqué
  });

  it('crée le catalogue de badges manquants', async () => {
    const badges: any = {
      findOne: jest.fn().mockResolvedValue(null),
      create: (x: any) => x,
      save: jest.fn().mockResolvedValue({}),
    };
    const service = new GamificationService(badges, {} as any, {} as any);
    await service.ensureCatalog();
    expect(badges.save).toHaveBeenCalled();
  });
});
