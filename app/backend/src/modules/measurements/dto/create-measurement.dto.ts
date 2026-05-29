import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID, Max, Min, IsNumber, IsDateString } from 'class-validator';

export class CreateMeasurementDto {
  @ApiProperty()
  @IsUUID()
  containerId: string;

  @ApiProperty({ example: 75, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  fillLevel: number;

  @ApiPropertyOptional({ example: 18.5 })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiPropertyOptional({ example: 88, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  battery?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  recordedAt?: string;
}
