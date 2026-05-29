import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';

@ApiTags('gamification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamification: GamificationService) {}

  @Get('leaderboard')
  @ApiOperation({ summary: 'Classement des citoyens les plus actifs' })
  leaderboard(@Query('limit') limit?: string) {
    return this.gamification.leaderboard(limit ? parseInt(limit, 10) : 10);
  }

  @Get('me')
  @ApiOperation({ summary: 'Mon profil gamifié (points + badges)' })
  me(@CurrentUser() user: JwtUser) {
    return this.gamification.profile(user.userId);
  }
}
