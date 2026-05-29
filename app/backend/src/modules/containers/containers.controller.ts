import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ContainersService } from './containers.service';
import { CreateContainerDto } from './dto/create-container.dto';
import { UpdateThresholdsDto } from './dto/update-thresholds.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { ContainerStatus } from '../../common/enums/domain.enums';

@ApiTags('containers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('containers')
export class ContainersController {
  constructor(private readonly containers: ContainersService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des conteneurs (filtrable par zone et état)' })
  @ApiQuery({ name: 'zoneId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ContainerStatus })
  findAll(@Query('zoneId') zoneId?: string, @Query('status') status?: ContainerStatus) {
    return this.containers.findAll({ zoneId, status });
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Conteneurs dans un rayon (mètres) — requête PostGIS' })
  nearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius = '500',
  ) {
    return this.containers.nearby(parseFloat(lat), parseFloat(lng), parseInt(radius, 10));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.containers.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.GESTIONNAIRE, Role.ADMIN)
  @ApiOperation({ summary: 'Créer un conteneur (GESTIONNAIRE/ADMIN)' })
  create(@Body() dto: CreateContainerDto) {
    return this.containers.create(dto);
  }

  @Patch(':id/thresholds')
  @UseGuards(RolesGuard)
  @Roles(Role.GESTIONNAIRE, Role.ADMIN)
  @ApiOperation({ summary: "Configurer les seuils d'alerte d'un conteneur (UC-AD02)" })
  updateThresholds(@Param('id') id: string, @Body() dto: UpdateThresholdsDto) {
    return this.containers.updateThresholds(id, dto.thresholdWarn, dto.thresholdCritical);
  }
}
