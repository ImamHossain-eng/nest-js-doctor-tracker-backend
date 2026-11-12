import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePatientDto {
  @ApiProperty({
    example: 'James Wilson',
    description: 'Full name of the patient',
  })
  @IsString()
  @IsNotEmpty({ message: 'Patient name is required' })
  name: string;

  @ApiProperty({
    example: 45,
    description: 'Patient age in years',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'Age must be 0 or greater' })
  age: number;

  @ApiProperty({
    example: 'Male',
    enum: ['Male', 'Female', 'Other'],
    description: 'Patient gender',
  })
  @IsIn(['Male', 'Female', 'Other'], {
    message: 'Gender must be Male, Female, or Other',
  })
  gender: string;

  @ApiProperty({
    example: 'Hypertension',
    description: 'Medical condition, diagnosis, or reason for care',
  })
  @IsString()
  @IsNotEmpty({ message: 'Patient condition/diagnosis is required' })
  condition: string;

  @ApiProperty({
    example: '67345b128f742cb672f518a1',
    description: 'MongoDB ObjectId of the assigned doctor',
  })
  @IsMongoId({ message: 'A valid Doctor ID must be provided' })
  @IsNotEmpty({ message: 'Doctor assignment is required' })
  doctorId: string;

  @ApiProperty({
    example: '+1 555-1001',
    description: 'Contact phone number of patient or emergency contact',
  })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  phone: string;

  @ApiPropertyOptional({
    example: 'james.wilson@example.com',
    description: 'Optional contact email address',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Must be a valid email' })
  email?: string;

  @ApiPropertyOptional({
    example: 'Active',
    enum: ['Active', 'Under Observation', 'Discharged', 'Recovered'],
    default: 'Active',
    description: 'Current treatment status',
  })
  @IsOptional()
  @IsIn(['Active', 'Under Observation', 'Discharged', 'Recovered'])
  status?: string;

  @ApiPropertyOptional({
    example: '2026-11-12T10:00:00.000Z',
    description: 'Admitted / registered date (defaults to now)',
  })
  @IsOptional()
  admittedDate?: Date;
}
