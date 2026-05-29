import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { Role } from '../../common/enums/role.enum';

jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('refuse un email déjà utilisé', async () => {
    const repo: any = { findOne: jest.fn().mockResolvedValue({ id: 'x' }) };
    const service = new UsersService(repo);
    await expect(
      service.create({ email: 'a@b.fr', password: 'pw', firstName: 'A', lastName: 'B' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('crée un utilisateur avec mot de passe hashé', async () => {
    mockedBcrypt.hash.mockResolvedValue('hashed' as never);
    const repo: any = {
      findOne: jest.fn().mockResolvedValue(null),
      create: (x: any) => x,
      save: jest.fn().mockImplementation(async (u) => ({ id: 'u1', ...u })),
    };
    const service = new UsersService(repo);
    const u = await service.create({ email: 'a@b.fr', password: 'pw', firstName: 'A', lastName: 'B' });
    expect(u.passwordHash).toBe('hashed');
    expect(u.role).toBe(Role.CITOYEN);
  });

  it('verrouille le compte au 5e échec', async () => {
    const repo: any = {
      findOne: jest.fn().mockResolvedValue({ id: 'u1', failedLoginAttempts: 4 }),
      update: jest.fn().mockResolvedValue({}),
    };
    const service = new UsersService(repo);
    const locked = await service.registerFailedAttempt('u1');
    expect(locked).toBe(true);
    const arg = repo.update.mock.calls[0][1];
    expect(arg.lockedUntil).toBeInstanceOf(Date);
    expect(arg.failedLoginAttempts).toBe(0);
  });

  it('incrémente sans verrouiller sous le seuil', async () => {
    const repo: any = {
      findOne: jest.fn().mockResolvedValue({ id: 'u1', failedLoginAttempts: 1 }),
      update: jest.fn().mockResolvedValue({}),
    };
    const service = new UsersService(repo);
    const locked = await service.registerFailedAttempt('u1');
    expect(locked).toBe(false);
    expect(repo.update).toHaveBeenCalledWith('u1', { failedLoginAttempts: 2 });
  });

  it('réinitialise les tentatives', async () => {
    const repo: any = { update: jest.fn().mockResolvedValue({}) };
    const service = new UsersService(repo);
    await service.resetFailedAttempts('u1');
    expect(repo.update).toHaveBeenCalledWith('u1', { failedLoginAttempts: 0, lockedUntil: null });
  });

  it('active la MFA', async () => {
    const repo: any = { update: jest.fn().mockResolvedValue({}) };
    const service = new UsersService(repo);
    await service.setMfaEnabled('u1', true);
    expect(repo.update).toHaveBeenCalledWith('u1', { mfaEnabled: true });
  });
});
