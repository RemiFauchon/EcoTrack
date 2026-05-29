import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Signalement } from './signalement.entity';
import { CreateSignalementDto } from './dto/create-signalement.dto';
import { GamificationService } from '../gamification/gamification.service';
import { ChallengesService } from '../challenges/challenges.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { SignalementStatus } from '../../common/enums/domain.enums';

const POINTS_PER_SIGNALEMENT = 10;

@Injectable()
export class SignalementsService {
  constructor(
    @InjectRepository(Signalement) private readonly repo: Repository<Signalement>,
    private readonly gamification: GamificationService,
    private readonly challenges: ChallengesService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async create(
    authorId: string,
    dto: CreateSignalementDto,
    rewardPoints = true,
  ): Promise<Signalement> {
    const signalement = await this.repo.save(
      this.repo.create({
        citizenId: authorId,
        containerId: dto.containerId ?? null,
        type: dto.type,
        description: dto.description ?? '',
        photoUrl: dto.photoUrl ?? null,
        lat: dto.lat,
        lng: dto.lng,
      }),
    );
    // Récompense citoyenne (gamification) — pas pour les anomalies remontées par un agent
    if (rewardPoints) {
      await this.gamification.awardPoints(authorId, POINTS_PER_SIGNALEMENT);
      await this.challenges.registerContribution(authorId); // UC-C03
    }
    this.realtime.emitSignalement(signalement);
    return signalement;
  }

  findAll(status?: SignalementStatus): Promise<Signalement[]> {
    const where = status ? { status } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' }, take: 200 });
  }

  findMine(citizenId: string): Promise<Signalement[]> {
    return this.repo.find({ where: { citizenId }, order: { createdAt: 'DESC' } });
  }

  async resolve(id: string): Promise<Signalement> {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Signalement introuvable.');
    s.status = SignalementStatus.RESOLVED;
    s.resolvedAt = new Date();
    return this.repo.save(s);
  }

  countNew(): Promise<number> {
    return this.repo.count({ where: { status: SignalementStatus.NEW } });
  }
}
