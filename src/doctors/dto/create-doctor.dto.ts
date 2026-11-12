import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateDoctorDto {
  @ApiProperty({
    example: 'Dr. Gregory House',
    description: 'Full name of the doctor',
  })
  @IsString()
  @IsNotEmpty({ message: 'Doctor name is required' })
  name: string;

  @ApiProperty({
    example: 'Diagnostic Medicine',
    description: 'Medical specialty/field (e.g. Cardiology, Pediatrics, Neurology)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Specialization is required' })
  specialization: string;

  @ApiProperty({
    example: 'Princeton-Plainsboro Hospital',
    description: 'Name of the hospital or clinic',
  })
  @IsString()
  @IsNotEmpty({ message: 'Hospital is required' })
  hospital: string;

  @ApiProperty({
    example: '+1 555-0199',
    description: 'Contact phone number of the doctor',
  })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  phone: string;

  @ApiProperty({
    example: 'house@ppth.org',
    description: 'Unique email address of the doctor',
  })
  @IsEmail({}, { message: 'A valid email is required' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}
