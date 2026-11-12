import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'Dr. Gregory House',
    description: 'Full name of the user/admin',
  })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({
    example: 'admin@doctortracker.com',
    description: 'Valid email address for login',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: 'admin123456',
    description: 'Password with at least 6 characters',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiPropertyOptional({
    example: 'admin',
    enum: ['admin', 'staff'],
    default: 'admin',
    description: 'Role of the user',
  })
  @IsOptional()
  role?: string;
}
