import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AlertStatus } from '../../common/enums/domain.enums';

@ApiTags('alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alerts: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des alertes (filtrable par statut)' })
  @ApiQuery({ name: 'status', required: false, enum: AlertStatus })
  findAll(@Query('status') status?: AlertStatus) {
    return this.alerts.findAll(status);
  }

  @Patch(':id/acknowledge')
  @UseGuards(RolesGuard)
  @Roles(Role.GESTIONNAIRE, Role.ADMIN)
  @ApiOperation({ summary: 'Prendre en compte une alerte (GESTIONNAIRE/ADMIN)' })
  acknowledge(@Param('id') id: string) {
    return this.alerts.acknowledge(id);
  }

  @Patch(':id/resolve')
  @UseGuards(RolesGuard)
  @Roles(Role.GESTIONNAIRE, Role.ADMIN)
  @ApiOperation({ summary: 'Résoudre une alerte (GESTIONNAIRE/ADMIN)' })
  resolve(@Param('id') id: string) {
    return this.alerts.resolve(id);
  }
}
