import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('overview')
  @Roles(Role.AGENT, Role.GESTIONNAIRE, Role.ADMIN)
  @ApiOperation({ summary: 'KPIs du tableau de bord' })
  overview() {
    return this.reports.overview();
  }

  @Get('monthly')
  @Roles(Role.GESTIONNAIRE, Role.ADMIN)
  @ApiOperation({ summary: 'Rapport mensuel (UC-G03)' })
  @ApiQuery({ name: 'month', required: false, example: '2026-05' })
  monthly(@Query('month') month?: string) {
    return this.reports.monthly(month);
  }
}
