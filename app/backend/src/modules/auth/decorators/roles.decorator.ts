import { SetMetadata } from '@nestjs/common';
import { Role } from '../../../common/enums/role.enum';

export const ROLES_KEY = 'roles';

/** Restreint l'accès d'une route à un ou plusieurs rôles. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
