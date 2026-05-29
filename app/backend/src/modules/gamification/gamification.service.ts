import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Badge } from './badge.entity';
import { UserBadge } from './user-badge.entity';
import { UsersService } from '../users/users.service';

/** Catalogue de badges par défaut (créé au seed s'il est absent). */
export const DEFAULT_BADGES = [
  { code: 'FIRST_REPORT', label: 'Premier geste', description: 'Premier signalement', icon: '🌱', threshold: 10 },
  { code: 'ECO_CITIZEN', label: 'Éco-citoyen', description: '50 points cumulés', icon: '♻️', threshold: 50 },
  { code: 'GUARDIAN', label: 'Gardien du quartier', description: '150 points cumulés', icon: '🛡️', threshold: 150 },
  { code: 'CHAMPION', label: 'Champion du tri', description: '300 points cumulés', icon: '🏆', threshold: 300 },
];

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  constructor(
    @InjectRepository(Badge) private readonly badges: Repository<Badge>,
    @InjectRepository(UserBadge) private readonly userBadges: Repository<UserBadge>,
    private readonly users: UsersService,
  ) {}

  /** Crée les badges par défaut s'ils n'existent pas. */
  async ensureCatalog(): Promise<void> {
    for (const b of DEFAULT_BADGES) {
      const exists = await this.badges.findOne({ where: { code: b.code } });
      if (!exists) await this.badges.save(this.badges.create(b));
    }
  }

  /** Ajoute des points à un utilisateur et débloque les badges atteints. */
  async awardPoints(userId: string, delta: number): Promise<void> {
    await this.users.addPoints(userId, delta);
    const user = await this.users.findById(userId);
    if (!user) return;
    const eligible = await this.badges.find({
      where: { threshold: LessThanOrEqual(user.points) },
    });
    for (const badge of eligible) {
      const owned = await this.userBadges.findOne({
        where: { userId, badgeId: badge.id },
      });
      if (!owned) {
        await this.userBadges.save(this.userBadges.create({ userId, badgeId: badge.id }));
        this.logger.debug(`Badge "${badge.label}" débloqué pour ${userId}`);
      }
    }
  }

  /** Classement des citoyens les plus actifs. */
  async leaderboard(limit = 10) {
    const users = await this.users.findAll();
    return users
      .sort((a, b) => b.points - a.points)
      .slice(0, limit)
      .map((u, i) => ({
        rank: i + 1,
        userId: u.id,
        name: `${u.firstName} ${u.lastName}`,
        points: u.points,
      }));
  }

  /** Profil gamifié d'un utilisateur : points + badges débloqués. */
  async profile(userId: string) {
    const user = await this.users.findById(userId);
    const owned = await this.userBadges.find({ where: { userId } });
    const ownedIds = new Set(owned.map((o) => o.badgeId));
    const all = await this.badges.find({ order: { threshold: 'ASC' } });
    return {
      points: user?.points ?? 0,
      badges: all.map((b) => ({
        code: b.code,
        label: b.label,
        icon: b.icon,
        description: b.description,
        threshold: b.threshold,
        unlocked: ownedIds.has(b.id),
      })),
    };
  }
}
