import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChallengesService } from './challenges.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';

@ApiTags('challenges')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('challenges')
export class ChallengesController {
  constructor(private readonly challenges: ChallengesService) {}

  @Get()
  @ApiOperation({ summary: 'Défis collectifs actifs + ma participation' })
  list(@CurrentUser() user: JwtUser) {
    return this.challenges.listForUser(user.userId);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Rejoindre un défi collectif' })
  join(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.challenges.join(user.userId, id);
  }
}
