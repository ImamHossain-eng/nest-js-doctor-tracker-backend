import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DoctorDocument = Doctor & Document;

@Schema({ timestamps: true })
export class Doctor {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true, index: true })
  specialization: string;

  @Prop({ required: true, trim: true })
  hospital: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ default: 0 })
  patientCount: number;
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);

// Performance & Optimization: Text Index for full-text search across name, specialization, hospital, email
DoctorSchema.index({
  name: 'text',
  specialization: 'text',
  hospital: 'text',
  email: 'text',
});

// Performance & Optimization: Compound and single field indexes for sorting and filtering
DoctorSchema.index({ createdAt: -1 });
DoctorSchema.index({ specialization: 1, createdAt: -1 });
