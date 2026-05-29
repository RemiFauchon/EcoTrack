import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MeasurementsService } from './measurements.service';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('measurements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('measurements')
export class MeasurementsController {
  constructor(private readonly measurements: MeasurementsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.GESTIONNAIRE, Role.ADMIN)
  @ApiOperation({ summary: 'Enregistrer une mesure manuellement (test / saisie)' })
  record(@Body() dto: CreateMeasurementDto) {
    return this.measurements.record(dto);
  }

  @Get('container/:containerId')
  @ApiOperation({ summary: "Historique des mesures d'un conteneur" })
  history(@Param('containerId') containerId: string, @Query('limit') limit?: string) {
    return this.measurements.history(containerId, limit ? parseInt(limit, 10) : 100);
  }
}
