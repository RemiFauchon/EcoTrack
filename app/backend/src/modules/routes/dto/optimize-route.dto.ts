import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsDateString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class OptimizeRouteDto {
  @ApiPropertyOptional({ description: 'Limiter la tournée à une zone' })
  @IsOptional()
  @IsUUID()
  zoneId?: string;

  @ApiPropertyOptional({ description: 'Seuil de remplissage minimal à collecter (%)', example: 70 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  minFillLevel?: number;

  @ApiPropertyOptional({ description: 'Agent assigné à la tournée' })
  @IsOptional()
  @IsUUID()
  agentId?: string;

  @ApiPropertyOptional({ example: '2026-05-27' })
  @IsOptional()
  @IsDateString()
  scheduledFor?: string;
}
