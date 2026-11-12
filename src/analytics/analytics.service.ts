import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Doctor, DoctorDocument } from '../doctors/schemas/doctor.schema.js';
import { Patient, PatientDocument } from '../patients/schemas/patient.schema.js';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
  ) {}

  async getDashboardSummary() {
    // 1. High-level KPI Counts (in parallel for maximum throughput)
    const [totalDoctors, totalPatients, activePatients] = await Promise.all([
      this.doctorModel.countDocuments(),
      this.patientModel.countDocuments(),
      this.patientModel.countDocuments({ status: 'Active' }),
    ]);

    const avgPatientsPerDoctor =
      totalDoctors > 0 ? (totalPatients / totalDoctors).toFixed(1) : '0';

    // 2. Optimized Aggregation: Patients per doctor distribution (Bar Chart data)
    const patientsPerDoctor = await this.doctorModel.aggregate([
      {
        $lookup: {
          from: 'patients',
          localField: '_id',
          foreignField: 'doctorId',
          as: 'assignedPatients',
        },
      },
      {
        $project: {
          name: 1,
          specialization: 1,
          hospital: 1,
          count: { $size: '$assignedPatients' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // 3. Optimized Aggregation: Date-based registration trends (Area / Line Chart)
    const dateBasedStats = await this.patientModel.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          patients: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          patients: 1,
          _id: 0,
        },
      },
    ]);

    // 4. Optimized Aggregation: Patient Condition distribution (Donut / Pie Chart)
    const conditionStats = await this.patientModel.aggregate([
      {
        $group: {
          _id: '$condition',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 7 },
      {
        $project: {
          name: '$_id',
          value: '$count',
          _id: 0,
        },
      },
    ]);

    // 5. Doctor Specialization breakdown
    const specializationStats = await this.doctorModel.aggregate([
      {
        $group: {
          _id: '$specialization',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          specialization: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    // 6. Recent Patients
    const recentPatients = await this.patientModel
      .find()
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return {
      success: true,
      data: {
        kpi: {
          totalDoctors,
          totalPatients,
          activePatients,
          avgPatientsPerDoctor: parseFloat(avgPatientsPerDoctor),
        },
        patientsPerDoctor,
        dateBasedStats,
        conditionStats,
        specializationStats,
        recentPatients,
      },
    };
  }
}
