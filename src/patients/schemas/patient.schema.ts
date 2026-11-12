import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Doctor } from '../../doctors/schemas/doctor.schema.js';

export type PatientDocument = Patient & Document;

@Schema({ timestamps: true })
export class Patient {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, min: 0 })
  age: number;

  @Prop({ required: true, enum: ['Male', 'Female', 'Other'] })
  gender: string;

  @Prop({ required: true, trim: true, index: true })
  condition: string;

  @Prop({ type: Types.ObjectId, ref: Doctor.name, required: true, index: true })
  doctorId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ trim: true, lowercase: true })
  email?: string;

  @Prop({
    type: String,
    enum: ['Active', 'Under Observation', 'Discharged', 'Recovered'],
    default: 'Active',
    index: true,
  })
  status: string;

  @Prop({ default: Date.now })
  admittedDate: Date;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);

// Performance & Optimization Indexes:
// Compound index for querying a doctor's patients sorted by date
PatientSchema.index({ doctorId: 1, createdAt: -1 });

// Text index for search across patient name and condition
PatientSchema.index({ name: 'text', condition: 'text' });

// Date and condition indexes for fast filtering
PatientSchema.index({ createdAt: -1 });
PatientSchema.index({ condition: 1, createdAt: -1 });
