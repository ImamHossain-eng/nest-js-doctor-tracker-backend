import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Doctor, DoctorDocument } from './schemas/doctor.schema.js';
import { Patient, PatientDocument } from '../patients/schemas/patient.schema.js';
import { CreateDoctorDto } from './dto/create-doctor.dto.js';
import { UpdateDoctorDto } from './dto/update-doctor.dto.js';
import { QueryDoctorDto } from './dto/query-doctor.dto.js';
import { CreatePatientDto } from '../patients/dto/create-patient.dto.js';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
  ) {}

  async create(createDoctorDto: CreateDoctorDto) {
    const existing = await this.doctorModel.findOne({
      email: createDoctorDto.email.toLowerCase(),
    });
    if (existing) {
      throw new ConflictException('A doctor with this email already exists');
    }

    const doctor = new this.doctorModel({
      ...createDoctorDto,
      email: createDoctorDto.email.toLowerCase(),
    });

    return await doctor.save();
  }

  async findAll(queryDto: QueryDoctorDto) {
    const {
      page = 1,
      limit = 10,
      search,
      specialization,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    const filter: any = {};

    // Multi-field search
    if (search && search.trim()) {
      const term = search.trim();
      filter.$or = [
        { name: { $regex: term, $options: 'i' } },
        { specialization: { $regex: term, $options: 'i' } },
        { hospital: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
      ];
    }

    // Specialization filter
    if (specialization && specialization.trim()) {
      filter.specialization = { $regex: `^${specialization.trim()}$`, $options: 'i' };
    }

    // Date-wise filtering
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

    // Optimized aggregation query with $facet for pagination + total counts + live patient count
    const [result] = await this.doctorModel.aggregate([
      { $match: filter },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $sort: sortDirective },
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: 'patients',
                localField: '_id',
                foreignField: 'doctorId',
                as: 'patientsList',
              },
            },
            {
              $addFields: {
                patientCount: { $size: '$patientsList' },
              },
            },
            {
              $project: {
                patientsList: 0,
              },
            },
          ],
        },
      },
    ]);

    const total = result?.metadata[0]?.total || 0;
    const doctors = result?.data || [];

    return {
      success: true,
      data: doctors,
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
      throw new NotFoundException('Invalid Doctor ID format');
    }

    const doctor = await this.doctorModel.findById(id).lean();
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID "${id}" not found`);
    }

    // Include corresponding patients for this doctor
    const patients = await this.patientModel
      .find({ doctorId: new Types.ObjectId(id) })
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      data: {
        ...doctor,
        patients,
        patientCount: patients.length,
      },
    };
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid Doctor ID format');
    }

    if (updateDoctorDto.email) {
      const existing = await this.doctorModel.findOne({
        email: updateDoctorDto.email.toLowerCase(),
        _id: { $ne: id },
      });
      if (existing) {
        throw new ConflictException('A doctor with this email already exists');
      }
      updateDoctorDto.email = updateDoctorDto.email.toLowerCase();
    }

    const updated = await this.doctorModel
      .findByIdAndUpdate(id, { $set: updateDoctorDto }, { new: true })
      .lean();

    if (!updated) {
      throw new NotFoundException(`Doctor with ID "${id}" not found`);
    }

    return {
      success: true,
      message: 'Doctor updated successfully',
      data: updated,
    };
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid Doctor ID format');
    }

    const deleted = await this.doctorModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException(`Doctor with ID "${id}" not found`);
    }

    // Cascade delete or clean up patients under this doctor
    await this.patientModel.deleteMany({ doctorId: new Types.ObjectId(id) });

    return {
      success: true,
      message: 'Doctor and associated patients removed successfully',
    };
  }

  // Section 2.2: Add new patient under a specific doctor
  async addPatientUnderDoctor(doctorId: string, createPatientDto: Omit<CreatePatientDto, 'doctorId'>) {
    if (!Types.ObjectId.isValid(doctorId)) {
      throw new NotFoundException('Invalid Doctor ID format');
    }

    const doctor = await this.doctorModel.findById(doctorId);
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID "${doctorId}" not found`);
    }

    const patient = new this.patientModel({
      ...createPatientDto,
      doctorId: new Types.ObjectId(doctorId),
    });

    await patient.save();

    // Increment doctor patient count
    await this.doctorModel.findByIdAndUpdate(doctorId, {
      $inc: { patientCount: 1 },
    });

    return {
      success: true,
      message: 'Patient added under doctor successfully',
      data: patient,
    };
  }

  // Section 2.2: Delete patient from doctor's patient list
  async deletePatientUnderDoctor(doctorId: string, patientId: string) {
    if (!Types.ObjectId.isValid(doctorId) || !Types.ObjectId.isValid(patientId)) {
      throw new NotFoundException('Invalid ID format');
    }

    const patient = await this.patientModel.findOneAndDelete({
      _id: new Types.ObjectId(patientId),
      doctorId: new Types.ObjectId(doctorId),
    });

    if (!patient) {
      throw new NotFoundException('Patient not found under this doctor');
    }

    // Decrement doctor patient count
    await this.doctorModel.findByIdAndUpdate(doctorId, {
      $inc: { patientCount: -1 },
    });

    return {
      success: true,
      message: 'Patient removed from doctor successfully',
    };
  }
}
