import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsIn,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QueryPatientDto {
  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: 'Page number for pagination',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    default: 10,
    description: 'Number of records per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'Wilson',
    description: 'Search string across patient name, condition, and phone',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'Hypertension',
    description: 'Filter by exact condition or diagnosis',
  })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiPropertyOptional({
    example: '67345b128f742cb672f518a1',
    description: 'Filter by assigned Doctor ID',
  })
  @IsOptional()
  @IsMongoId()
  doctorId?: string;

  @ApiPropertyOptional({
    example: 'Active',
    enum: ['Active', 'Under Observation', 'Discharged', 'Recovered'],
    description: 'Filter by patient status',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'Filter from creation date (ISO format)',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-12-31',
    description: 'Filter until creation date (ISO format)',
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    example: 'createdAt',
    default: 'createdAt',
    description: 'Field to sort by',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
    description: 'Sort direction',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
