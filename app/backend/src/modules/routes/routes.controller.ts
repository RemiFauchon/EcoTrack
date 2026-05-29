import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RoutesService } from './routes.service';
import { OptimizeRouteDto } from './dto/optimize-route.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RouteStatus } from '../../common/enums/domain.enums';

@ApiTags('routes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('routes')
export class RoutesController {
  constructor(private readonly routes: RoutesService) {}

  @Post('optimize')
  @UseGuards(RolesGuard)
  @Roles(Role.GESTIONNAIRE, Role.ADMIN)
  @ApiOperation({ summary: 'Optimiser une tournée (TSP + 2-opt) — GESTIONNAIRE/ADMIN' })
  optimize(@Body() dto: OptimizeRouteDto) {
    return this.routes.optimize(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Liste des tournées (filtrable par agent/statut)' })
  @ApiQuery({ name: 'agentId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: RouteStatus })
  findAll(@Query('agentId') agentId?: string, @Query('status') status?: RouteStatus) {
    return this.routes.findAll({ agentId, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.routes.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.AGENT, Role.GESTIONNAIRE, Role.ADMIN)
  @ApiOperation({ summary: 'Mettre à jour le statut d’une tournée' })
  updateStatus(@Param('id') id: string, @Body('status') status: RouteStatus) {
    return this.routes.updateStatus(id, status);
  }

  @Post(':id/stops/:containerId/collect')
  @UseGuards(RolesGuard)
  @Roles(Role.AGENT, Role.GESTIONNAIRE, Role.ADMIN)
  @ApiOperation({ summary: 'Valider la collecte d’un arrêt (scan QR + volume + GPS) — UC-A02' })
  collectStop(
    @Param('id') id: string,
    @Param('containerId') containerId: string,
    @Body() body: { volumeLiters?: number; lat?: number; lng?: number },
  ) {
    return this.routes.collectStop(id, containerId, body ?? {});
  }
}
