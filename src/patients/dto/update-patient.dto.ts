import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePatientDto {
  @ApiPropertyOptional({
    example: 'James Wilson',
    description: 'Updated patient name',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 46,
    description: 'Updated patient age',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  age?: number;

  @ApiPropertyOptional({
    example: 'Male',
    enum: ['Male', 'Female', 'Other'],
    description: 'Updated gender',
  })
  @IsOptional()
  @IsIn(['Male', 'Female', 'Other'])
  gender?: string;

  @ApiPropertyOptional({
    example: 'Hypertension (Controlled)',
    description: 'Updated condition / diagnosis',
  })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiPropertyOptional({
    example: '67345b128f742cb672f518a1',
    description: 'Reassigned Doctor MongoDB ObjectId',
  })
  @IsOptional()
  @IsMongoId()
  doctorId?: string;

  @ApiPropertyOptional({
    example: '+1 555-1001',
    description: 'Updated contact phone number',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'james.wilson@example.com',
    description: 'Updated contact email address',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Must be a valid email' })
  email?: string;

  @ApiPropertyOptional({
    example: 'Recovered',
    enum: ['Active', 'Under Observation', 'Discharged', 'Recovered'],
    description: 'Updated treatment status',
  })
  @IsOptional()
  @IsIn(['Active', 'Under Observation', 'Discharged', 'Recovered'])
  status?: string;

  @ApiPropertyOptional({
    example: '2026-11-12T10:00:00.000Z',
    description: 'Updated admission date',
  })
  @IsOptional()
  admittedDate?: Date;
}
