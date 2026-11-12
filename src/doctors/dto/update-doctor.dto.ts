import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateDoctorDto {
  @ApiPropertyOptional({
    example: 'Dr. Gregory House',
    description: 'Updated name of the doctor',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Diagnostic Medicine',
    description: 'Updated specialization',
  })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({
    example: 'Princeton-Plainsboro Hospital',
    description: 'Updated hospital affiliation',
  })
  @IsOptional()
  @IsString()
  hospital?: string;

  @ApiPropertyOptional({
    example: '+1 555-0199',
    description: 'Updated phone number',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'house@ppth.org',
    description: 'Updated unique email address',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Must be a valid email' })
  email?: string;
}
