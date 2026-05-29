import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '../../common/enums/role.enum';

const BCRYPT_ROUNDS = 10; // cf. NFR sécurité du cahier des charges

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.repo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Un compte existe déjà avec cet email.');
    }
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = this.repo.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role ?? Role.CITOYEN,
    });
    return this.repo.save(user);
  }

  /** Récupère un utilisateur avec son hash (pour l'authentification). */
  findByEmailWithSecret(email: string): Promise<User | null> {
    return this.repo
      .createQueryBuilder('u')
      .addSelect(['u.passwordHash', 'u.refreshTokenHash', 'u.mfaSecret'])
      .where('u.email = :email', { email })
      .getOne();
  }

  findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByIdWithSecret(id: string): Promise<User | null> {
    return this.repo
      .createQueryBuilder('u')
      .addSelect(['u.refreshTokenHash', 'u.mfaSecret'])
      .where('u.id = :id', { id })
      .getOne();
  }

  findAll(): Promise<User[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async setRefreshTokenHash(id: string, hash: string | null): Promise<void> {
    await this.repo.update(id, { refreshTokenHash: hash });
  }

  async addPoints(id: string, delta: number): Promise<void> {
    await this.repo.increment({ id }, 'points', delta);
  }

  async updateRole(id: string, role: Role): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    user.role = role;
    return this.repo.save(user);
  }

  // ─── MFA & verrouillage (UC-T01) ───

  private static readonly MAX_ATTEMPTS = 5;
  private static readonly LOCK_MINUTES = 15;

  /** Incrémente les échecs ; verrouille le compte au-delà du seuil. Renvoie true si verrouillé. */
  async registerFailedAttempt(id: string): Promise<boolean> {
    const user = await this.findById(id);
    if (!user) return false;
    const attempts = user.failedLoginAttempts + 1;
    if (attempts >= UsersService.MAX_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + UsersService.LOCK_MINUTES * 60_000);
      await this.repo.update(id, { failedLoginAttempts: 0, lockedUntil });
      return true;
    }
    await this.repo.update(id, { failedLoginAttempts: attempts });
    return false;
  }

  async resetFailedAttempts(id: string): Promise<void> {
    await this.repo.update(id, { failedLoginAttempts: 0, lockedUntil: null });
  }

  async setMfaSecret(id: string, secret: string | null): Promise<void> {
    await this.repo.update(id, { mfaSecret: secret, mfaEnabled: false });
  }

  async setMfaEnabled(id: string, enabled: boolean): Promise<void> {
    await this.repo.update(id, { mfaEnabled: enabled });
  }
}
