import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Patient, PatientDocument } from './schemas/patient.schema.js';
import { Doctor, DoctorDocument } from '../doctors/schemas/doctor.schema.js';
import { CreatePatientDto } from './dto/create-patient.dto.js';
import { UpdatePatientDto } from './dto/update-patient.dto.js';
import { QueryPatientDto } from './dto/query-patient.dto.js';

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
  ) {}

  async create(createPatientDto: CreatePatientDto) {
    if (!Types.ObjectId.isValid(createPatientDto.doctorId)) {
      throw new BadRequestException('Invalid Doctor ID');
    }

    const doctor = await this.doctorModel.findById(createPatientDto.doctorId);
    if (!doctor) {
      throw new NotFoundException('Assigned doctor does not exist');
    }

    const patient = new this.patientModel({
      ...createPatientDto,
      doctorId: new Types.ObjectId(createPatientDto.doctorId),
    });

    const saved = await patient.save();

    // Increment doctor's patient count
    await this.doctorModel.findByIdAndUpdate(createPatientDto.doctorId, {
      $inc: { patientCount: 1 },
    });

    return saved;
  }

  async findAll(queryDto: QueryPatientDto) {
    const {
      page = 1,
      limit = 10,
      search,
      condition,
      doctorId,
      status,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    const filter: any = {};

    // Search by patient name or condition
    if (search && search.trim()) {
      const term = search.trim();
      filter.$or = [
        { name: { $regex: term, $options: 'i' } },
        { condition: { $regex: term, $options: 'i' } },
        { phone: { $regex: term, $options: 'i' } },
      ];
    }

    // Condition filter
    if (condition && condition.trim()) {
      filter.condition = { $regex: `^${condition.trim()}$`, $options: 'i' };
    }

    // Assigned Doctor filter
    if (doctorId && Types.ObjectId.isValid(doctorId)) {
      filter.doctorId = new Types.ObjectId(doctorId);
    }

    // Status filter
    if (status && status.trim()) {
      filter.status = status.trim();
    }

    // Date-wise filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const skip = (page - 1) * limit;
    const sortDirective: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [patients, total] = await Promise.all([
      this.patientModel
        .find(filter)
        .populate('doctorId', 'name specialization hospital email')
        .sort(sortDirective)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.patientModel.countDocuments(filter),
    ]);

    return {
      success: true,
      data: patients,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid Patient ID format');
    }

    const patient = await this.patientModel
      .findById(id)
      .populate('doctorId', 'name specialization hospital email')
      .lean();

    if (!patient) {
      throw new NotFoundException(`Patient with ID "${id}" not found`);
    }

    return {
      success: true,
      data: patient,
    };
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid Patient ID format');
    }

    const currentPatient = await this.patientModel.findById(id);
    if (!currentPatient) {
      throw new NotFoundException(`Patient with ID "${id}" not found`);
    }

    // If changing doctor assignment, update counts for both old and new doctors
    if (
      updatePatientDto.doctorId &&
      updatePatientDto.doctorId !== currentPatient.doctorId.toString()
    ) {
      if (!Types.ObjectId.isValid(updatePatientDto.doctorId)) {
        throw new BadRequestException('Invalid Doctor ID format');
      }
      const newDoctor = await this.doctorModel.findById(updatePatientDto.doctorId);
      if (!newDoctor) {
        throw new NotFoundException('Assigned doctor does not exist');
      }

      await this.doctorModel.findByIdAndUpdate(currentPatient.doctorId, {
        $inc: { patientCount: -1 },
      });
      await this.doctorModel.findByIdAndUpdate(updatePatientDto.doctorId, {
        $inc: { patientCount: 1 },
      });
    }

    const updated = await this.patientModel
      .findByIdAndUpdate(id, { $set: updatePatientDto }, { new: true })
      .populate('doctorId', 'name specialization hospital email')
      .lean();

    return {
      success: true,
      message: 'Patient updated successfully',
      data: updated,
    };
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid Patient ID format');
    }

    const deleted = await this.patientModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException(`Patient with ID "${id}" not found`);
    }

    // Decrement doctor's count
    await this.doctorModel.findByIdAndUpdate(deleted.doctorId, {
      $inc: { patientCount: -1 },
    });

    return {
      success: true,
      message: 'Patient removed successfully',
    };
  }
}
