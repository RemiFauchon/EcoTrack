import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { Role } from '../../common/enums/role.enum';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}
export interface MfaChallenge {
  mfaRequired: true;
  mfaToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /** Inscription publique : toujours en tant que CITOYEN. */
  async register(dto: RegisterDto): Promise<Tokens> {
    const user = await this.users.create({ ...dto, role: Role.CITOYEN });
    return this.issueTokens(user);
  }

  async login(dto: LoginDto): Promise<Tokens | MfaChallenge> {
    const user = await this.users.findByEmailWithSecret(dto.email);
    if (!user) throw new UnauthorizedException('Identifiants invalides.');

    // Verrouillage (UC-T01)
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException('Compte temporairement verrouillé (trop de tentatives). Réessayez plus tard.');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      const locked = await this.users.registerFailedAttempt(user.id);
      throw new UnauthorizedException(
        locked
          ? 'Identifiants invalides. Compte verrouillé 15 min après 5 échecs.'
          : 'Identifiants invalides.',
      );
    }
    await this.users.resetFailedAttempts(user.id);

    // MFA (obligatoire si activée — gestionnaire/admin)
    if (user.mfaEnabled) {
      const mfaToken = await this.jwt.signAsync(
        { sub: user.id, mfa: true },
        { secret: this.config.get<string>('jwt.accessSecret'), expiresIn: '5m' },
      );
      return { mfaRequired: true, mfaToken };
    }

    return this.issueTokens(user);
  }

  /** Vérifie le code TOTP à l'étape 2 de la connexion. */
  async verifyMfa(mfaToken: string, code: string): Promise<Tokens> {
    let payload: { sub: string; mfa?: boolean };
    try {
      payload = await this.jwt.verifyAsync(mfaToken, {
        secret: this.config.get<string>('jwt.accessSecret'),
      });
    } catch {
      throw new UnauthorizedException('Session MFA expirée, reconnectez-vous.');
    }
    if (!payload.mfa) throw new UnauthorizedException('Jeton MFA invalide.');
    const user = await this.users.findByIdWithSecret(payload.sub);
    if (!user?.mfaSecret) throw new UnauthorizedException('MFA non configurée.');
    if (!authenticator.verify({ token: code, secret: user.mfaSecret })) {
      throw new UnauthorizedException('Code de vérification invalide.');
    }
    return this.issueTokens(user);
  }

  /** Génère un secret + QR code pour enrôler une application d'authentification. */
  async setupMfa(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException();
    const secret = authenticator.generateSecret();
    await this.users.setMfaSecret(userId, secret);
    const otpauthUrl = authenticator.keyuri(user.email, 'ECOTRACK', secret);
    const qr = await QRCode.toDataURL(otpauthUrl);
    return { otpauthUrl, qr };
  }

  /** Active la MFA après vérification d'un premier code. */
  async enableMfa(userId: string, code: string) {
    const user = await this.users.findByIdWithSecret(userId);
    if (!user?.mfaSecret) throw new UnauthorizedException('Initialisez la MFA d’abord.');
    if (!authenticator.verify({ token: code, secret: user.mfaSecret })) {
      throw new UnauthorizedException('Code invalide.');
    }
    await this.users.setMfaEnabled(userId, true);
    return { enabled: true };
  }

  async refresh(userId: string, refreshToken: string): Promise<Tokens> {
    const user = await this.users.findByIdWithSecret(userId);
    if (!user || !user.refreshTokenHash) throw new UnauthorizedException('Session invalide.');
    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) throw new UnauthorizedException('Session invalide.');
    return this.issueTokens(user);
  }

  async logout(userId: string): Promise<void> {
    await this.users.setRefreshTokenHash(userId, null);
  }

  private async issueTokens(user: User): Promise<Tokens> {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('jwt.accessSecret'),
      expiresIn: this.config.get<number>('jwt.accessTtl'),
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('jwt.refreshSecret'),
      expiresIn: this.config.get<number>('jwt.refreshTtl'),
    });
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.users.setRefreshTokenHash(user.id, hash);
    return { accessToken, refreshToken };
  }
}
