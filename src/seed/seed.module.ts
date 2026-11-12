import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service.js';
import { User, UserSchema } from '../auth/schemas/user.schema.js';
import { Doctor, DoctorSchema } from '../doctors/schemas/doctor.schema.js';
import { Patient, PatientSchema } from '../patients/schemas/patient.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Doctor.name, schema: DoctorSchema },
      { name: Patient.name, schema: PatientSchema },
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
