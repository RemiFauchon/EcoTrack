import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import { AuthService } from './auth.service';
import { Role } from '../../common/enums/role.enum';

jest.mock('bcrypt');
jest.mock('otplib', () => ({ authenticator: { verify: jest.fn(), generateSecret: jest.fn(), keyuri: jest.fn() } }));

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedAuthenticator = authenticator as jest.Mocked<typeof authenticator>;

function build(userOverrides: any = {}) {
  const user = {
    id: 'u1',
    email: 'a@b.fr',
    role: Role.GESTIONNAIRE,
    passwordHash: 'hash',
    mfaEnabled: false,
    mfaSecret: null,
    lockedUntil: null,
    ...userOverrides,
  };
  const users: any = {
    findByEmailWithSecret: jest.fn().mockResolvedValue(user),
    findByIdWithSecret: jest.fn().mockResolvedValue(user),
    findById: jest.fn().mockResolvedValue(user),
    registerFailedAttempt: jest.fn().mockResolvedValue(false),
    resetFailedAttempts: jest.fn().mockResolvedValue(undefined),
    setRefreshTokenHash: jest.fn().mockResolvedValue(undefined),
    setMfaSecret: jest.fn(),
    setMfaEnabled: jest.fn(),
  };
  const jwt: any = { signAsync: jest.fn().mockResolvedValue('tok'), verifyAsync: jest.fn() };
  const config: any = { get: jest.fn().mockReturnValue('secret') };
  return { service: new AuthService(users, jwt, config), users, jwt, user };
}

describe('AuthService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejette un email inconnu', async () => {
    const { service, users } = build();
    users.findByEmailWithSecret.mockResolvedValue(null);
    await expect(service.login({ email: 'x', password: 'y' })).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refuse un compte verrouillé (403)', async () => {
    const { service } = build({ lockedUntil: new Date(Date.now() + 60_000) });
    await expect(service.login({ email: 'a@b.fr', password: 'p' })).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('incrémente les échecs sur mauvais mot de passe', async () => {
    const { service, users } = build();
    mockedBcrypt.compare.mockResolvedValue(false as never);
    await expect(service.login({ email: 'a@b.fr', password: 'bad' })).rejects.toBeInstanceOf(UnauthorizedException);
    expect(users.registerFailedAttempt).toHaveBeenCalledWith('u1');
  });

  it('renvoie des tokens si mot de passe correct et pas de MFA', async () => {
    const { service, users } = build();
    mockedBcrypt.compare.mockResolvedValue(true as never);
    mockedBcrypt.hash.mockResolvedValue('refreshhash' as never);
    const res: any = await service.login({ email: 'a@b.fr', password: 'good' });
    expect(res.accessToken).toBe('tok');
    expect(res.refreshToken).toBe('tok');
    expect(users.resetFailedAttempts).toHaveBeenCalledWith('u1');
  });

  it('exige la MFA si activée', async () => {
    const { service } = build({ mfaEnabled: true });
    mockedBcrypt.compare.mockResolvedValue(true as never);
    const res: any = await service.login({ email: 'a@b.fr', password: 'good' });
    expect(res.mfaRequired).toBe(true);
    expect(res.mfaToken).toBe('tok');
  });

  it('verifyMfa : code invalide rejeté', async () => {
    const { service, jwt } = build({ mfaSecret: 'S', mfaEnabled: true });
    jwt.verifyAsync.mockResolvedValue({ sub: 'u1', mfa: true });
    mockedAuthenticator.verify.mockReturnValue(false);
    await expect(service.verifyMfa('mtok', '000000')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('verifyMfa : code valide → tokens', async () => {
    const { service, jwt } = build({ mfaSecret: 'S', mfaEnabled: true });
    jwt.verifyAsync.mockResolvedValue({ sub: 'u1', mfa: true });
    mockedAuthenticator.verify.mockReturnValue(true);
    mockedBcrypt.hash.mockResolvedValue('h' as never);
    const res: any = await service.verifyMfa('mtok', '123456');
    expect(res.accessToken).toBe('tok');
  });
});
