import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContainerDto {
  @ApiProperty({ example: 'CT-0001' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ example: '12 rue de la République, Lyon' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacityLiters?: number;

  @ApiProperty({ example: 45.764 })
  @Type(() => Number)
  @IsLatitude()
  lat: number;

  @ApiProperty({ example: 4.8357 })
  @Type(() => Number)
  @IsLongitude()
  lng: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  zoneId?: string;

  @ApiPropertyOptional({ example: 70 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  thresholdWarn?: number;

  @ApiPropertyOptional({ example: 90 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  thresholdCritical?: number;
}
