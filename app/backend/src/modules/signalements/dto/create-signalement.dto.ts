import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export const SIGNALEMENT_TYPES = [
  'CONTENEUR_PLEIN',
  'DEPOT_SAUVAGE',
  'CONTENEUR_ENDOMMAGE',
] as const;

export class CreateSignalementDto {
  @ApiPropertyOptional({ description: 'Conteneur concerné (optionnel)' })
  @IsOptional()
  @IsUUID()
  containerId?: string;

  @ApiProperty({ enum: SIGNALEMENT_TYPES })
  @IsIn(SIGNALEMENT_TYPES as unknown as string[])
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: "URL de la photo jointe" })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiProperty({ example: 45.764 })
  @Type(() => Number)
  @IsLatitude()
  lat: number;

  @ApiProperty({ example: 4.8357 })
  @Type(() => Number)
  @IsLongitude()
  lng: number;
}
