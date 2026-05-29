import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SignalementsService } from './signalements.service';
import { CreateSignalementDto } from './dto/create-signalement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';
import { SignalementStatus } from '../../common/enums/domain.enums';

@ApiTags('signalements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('signalements')
export class SignalementsController {
  constructor(private readonly signalements: SignalementsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un signalement (citoyen +10 pts ; agent = anomalie sans points)' })
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateSignalementDto) {
    return this.signalements.create(user.userId, dto, user.role === Role.CITOYEN);
  }

  @Get('mine')
  @ApiOperation({ summary: 'Mes signalements' })
  mine(@CurrentUser() user: JwtUser) {
    return this.signalements.findMine(user.userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.GESTIONNAIRE, Role.ADMIN)
  @ApiOperation({ summary: 'Liste des signalements (GESTIONNAIRE/ADMIN)' })
  @ApiQuery({ name: 'status', required: false, enum: SignalementStatus })
  findAll(@Query('status') status?: SignalementStatus) {
    return this.signalements.findAll(status);
  }

  @Patch(':id/resolve')
  @UseGuards(RolesGuard)
  @Roles(Role.GESTIONNAIRE, Role.ADMIN)
  @ApiOperation({ summary: 'Résoudre un signalement (GESTIONNAIRE/ADMIN)' })
  resolve(@Param('id') id: string) {
    return this.signalements.resolve(id);
  }
}
