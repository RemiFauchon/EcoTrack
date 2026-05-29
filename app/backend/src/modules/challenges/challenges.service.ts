import { Injectable, Logger, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Challenge } from './challenge.entity';
import { ChallengeParticipation } from './challenge-participation.entity';
import { GamificationService } from '../gamification/gamification.service';

@Injectable()
export class ChallengesService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ChallengesService.name);

  constructor(
    @InjectRepository(Challenge) private readonly challenges: Repository<Challenge>,
    @InjectRepository(ChallengeParticipation) private readonly parts: Repository<ChallengeParticipation>,
    private readonly gamification: GamificationService,
  ) {}

  async onApplicationBootstrap() {
    if ((await this.challenges.count()) > 0) return;
    const now = new Date();
    const end = new Date(now.getTime() + 30 * 86400_000);
    await this.challenges.save([
      this.challenges.create({
        code: 'ZERO_DEBORDEMENT_CENTRE',
        title: 'Zéro débordement — Centre',
        description: 'Ensemble, signalons les conteneurs pleins du centre-ville ce mois-ci.',
        goal: 20,
        rewardPoints: 50,
        startsAt: now,
        endsAt: end,
      }),
      this.challenges.create({
        code: 'QUARTIER_PROPRE',
        title: 'Quartier propre',
        description: 'Objectif collectif : 40 signalements pour un quartier impeccable.',
        goal: 40,
        rewardPoints: 80,
        startsAt: now,
        endsAt: end,
      }),
    ]);
    this.logger.log('Défis collectifs initialisés.');
  }

  private activeQuery() {
    const now = new Date();
    return { startsAt: LessThanOrEqual(now), endsAt: MoreThanOrEqual(now) };
  }

  async listForUser(userId: string) {
    const active = await this.challenges.find({ where: this.activeQuery(), order: { endsAt: 'ASC' } });
    const mine = await this.parts.find({ where: { userId } });
    const joined = new Map(mine.map((p) => [p.challengeId, p]));
    return active.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      goal: c.goal,
      current: c.current,
      rewardPoints: c.rewardPoints,
      endsAt: c.endsAt,
      completed: c.completed,
      joined: joined.has(c.id),
      myContribution: joined.get(c.id)?.contribution ?? 0,
    }));
  }

  async join(userId: string, challengeId: string) {
    const challenge = await this.challenges.findOne({ where: { id: challengeId } });
    if (!challenge) throw new NotFoundException('Défi introuvable.');
    const existing = await this.parts.findOne({ where: { userId, challengeId } });
    if (!existing) {
      await this.parts.save(this.parts.create({ userId, challengeId }));
    }
    return { joined: true };
  }

  /** Comptabilise un signalement dans les défis actifs auxquels le citoyen participe. */
  async registerContribution(userId: string) {
    const active = await this.challenges.find({ where: this.activeQuery() });
    for (const c of active) {
      const part = await this.parts.findOne({ where: { userId, challengeId: c.id } });
      if (!part) continue; // n'a pas rejoint ce défi
      part.contribution += 1;
      await this.parts.save(part);
      c.current += 1;
      if (c.current >= c.goal && !c.completed) {
        c.completed = true;
        // Récompense collective : chaque participant reçoit les points
        const participants = await this.parts.find({ where: { challengeId: c.id } });
        for (const p of participants) {
          if (!p.rewarded) {
            await this.gamification.awardPoints(p.userId, c.rewardPoints);
            p.rewarded = true;
            await this.parts.save(p);
          }
        }
        this.logger.log(`Défi "${c.title}" complété — récompenses distribuées.`);
      }
      await this.challenges.save(c);
    }
  }
}
