import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class UpdateThresholdsDto {
  @ApiProperty({ example: 70 })
  @IsInt()
  @Min(1)
  @Max(100)
  thresholdWarn: number;

  @ApiProperty({ example: 90 })
  @IsInt()
  @Min(1)
  @Max(100)
  thresholdCritical: number;
}
