import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../auth/schemas/user.schema.js';
import { Doctor, DoctorDocument } from '../doctors/schemas/doctor.schema.js';
import { Patient, PatientDocument } from '../patients/schemas/patient.schema.js';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
  ) {}

  async seed() {
    this.logger.log('🌱 Starting database seeding...');

    // 1. Seed Admin User
    const adminEmail = 'admin@doctortracker.com';
    let admin = await this.userModel.findOne({ email: adminEmail });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123456', 10);
      admin = await this.userModel.create({
        name: 'Chief Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });
      this.logger.log(`Created admin user: ${adminEmail} (password: admin123456)`);
    } else {
      this.logger.log(`Admin user already exists: ${adminEmail}`);
    }

    // 2. Clear existing sample data if requested or seed if empty
    const doctorCount = await this.doctorModel.countDocuments();
    if (doctorCount > 0) {
      this.logger.log(`Database already has ${doctorCount} doctors. Skipping sample seeding.`);
      return { message: 'Database already seeded' };
    }

    this.logger.log('Seeding doctors and patients...');

    const sampleDoctors = [
      {
        name: 'Dr. Gregory House',
        specialization: 'Diagnostic Medicine',
        hospital: 'Princeton-Plainsboro Hospital',
        phone: '+1 555-0199',
        email: 'house@ppth.org',
      },
      {
        name: 'Dr. Meredith Grey',
        specialization: 'General Surgery',
        hospital: 'Grey Sloan Memorial Hospital',
        phone: '+1 555-0144',
        email: 'greym@greysloan.org',
      },
      {
        name: 'Dr. Leonard McCoy',
        specialization: 'Cardiology',
        hospital: 'Metro General Medical Center',
        phone: '+1 555-0177',
        email: 'mccoy@metrogeneral.org',
      },
      {
        name: 'Dr. Cristina Yang',
        specialization: 'Cardiothoracic Surgery',
        hospital: 'Klausman Institute',
        phone: '+1 555-0133',
        email: 'yangc@klausman.org',
      },
      {
        name: 'Dr. Shaun Murphy',
        specialization: 'Pediatrics',
        hospital: 'St. Bonaventure Hospital',
        phone: '+1 555-0155',
        email: 'murphys@stbonaventure.org',
      },
      {
        name: 'Dr. Stephen Strange',
        specialization: 'Neurology',
        hospital: 'Metro Neurological Center',
        phone: '+1 555-0188',
        email: 'strange@metroneuro.org',
      },
      {
        name: 'Dr. Allison Cameron',
        specialization: 'Immunology',
        hospital: 'Princeton-Plainsboro Hospital',
        phone: '+1 555-0122',
        email: 'camerona@ppth.org',
      },
      {
        name: 'Dr. John Watson',
        specialization: 'Orthopedics',
        hospital: 'St. Bartholomew Hospital',
        phone: '+1 555-0111',
        email: 'watsonj@stbarts.org',
      },
    ];

    const createdDoctors = await this.doctorModel.insertMany(sampleDoctors);
    this.logger.log(`Seeded ${createdDoctors.length} doctors.`);

    // 3. Seed Patients with spread timestamps over the past 30 days
    const conditions = [
      'Hypertension',
      'Type 2 Diabetes',
      'Coronary Artery Disease',
      'Severe Asthma',
      'Chronic Migraine',
      'Rheumatoid Arthritis',
      'Post-Op Recovery',
      'Cardiac Arrhythmia',
      'Epilepsy',
      'Pediatric Pneumonia',
    ];

    const samplePatientNames = [
      { name: 'James Wilson', age: 48, gender: 'Male', phone: '+1 555-1001' },
      { name: 'Sarah Connor', age: 35, gender: 'Female', phone: '+1 555-1002' },
      { name: 'Bruce Wayne', age: 42, gender: 'Male', phone: '+1 555-1003' },
      { name: 'Diana Prince', age: 31, gender: 'Female', phone: '+1 555-1004' },
      { name: 'Peter Parker', age: 24, gender: 'Male', phone: '+1 555-1005' },
      { name: 'Natasha Romanoff', age: 36, gender: 'Female', phone: '+1 555-1006' },
      { name: 'Clark Kent', age: 39, gender: 'Male', phone: '+1 555-1007' },
      { name: 'Barry Allen', age: 29, gender: 'Male', phone: '+1 555-1008' },
      { name: 'Wanda Maximoff', age: 32, gender: 'Female', phone: '+1 555-1009' },
      { name: 'Tony Stark', age: 50, gender: 'Male', phone: '+1 555-1010' },
      { name: 'Arthur Curry', age: 38, gender: 'Male', phone: '+1 555-1011' },
      { name: 'Emma Watson', age: 27, gender: 'Female', phone: '+1 555-1012' },
      { name: 'Stephen King', age: 65, gender: 'Male', phone: '+1 555-1013' },
      { name: 'Lucas Scott', age: 19, gender: 'Male', phone: '+1 555-1014' },
      { name: 'Haley James', age: 22, gender: 'Female', phone: '+1 555-1015' },
      { name: 'Rachel Green', age: 34, gender: 'Female', phone: '+1 555-1016' },
      { name: 'Monica Geller', age: 33, gender: 'Female', phone: '+1 555-1017' },
      { name: 'Chandler Bing', age: 36, gender: 'Male', phone: '+1 555-1018' },
      { name: 'Ross Geller', age: 37, gender: 'Male', phone: '+1 555-1019' },
      { name: 'Phoebe Buffay', age: 35, gender: 'Female', phone: '+1 555-1020' },
      { name: 'Elena Gilbert', age: 23, gender: 'Female', phone: '+1 555-1021' },
      { name: 'Damon Salvatore', age: 41, gender: 'Male', phone: '+1 555-1022' },
      { name: 'Stefan Salvatore', age: 37, gender: 'Male', phone: '+1 555-1023' },
      { name: 'Bonnie Bennett', age: 25, gender: 'Female', phone: '+1 555-1024' },
    ];

    const patientsToInsert = samplePatientNames.map((p, index) => {
      const assignedDoctor = createdDoctors[index % createdDoctors.length];
      const condition = conditions[index % conditions.length];
      // Distribute dates over last 30 days
      const daysAgo = (index * 1.25) | 0;
      const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      return {
        name: p.name,
        age: p.age,
        gender: p.gender,
        condition,
        doctorId: assignedDoctor._id,
        phone: p.phone,
        email: `${p.name.toLowerCase().replace(' ', '.')}@example.com`,
        status: index % 4 === 0 ? 'Under Observation' : index % 7 === 0 ? 'Discharged' : 'Active',
        admittedDate: date,
        createdAt: date,
        updatedAt: date,
      };
    });

    await this.patientModel.insertMany(patientsToInsert);
    this.logger.log(`Seeded ${patientsToInsert.length} patients.`);

    // Update patientCount for each doctor
    for (const doc of createdDoctors) {
      const count = await this.patientModel.countDocuments({ doctorId: doc._id });
      await this.doctorModel.findByIdAndUpdate(doc._id, { patientCount: count });
    }

    this.logger.log('🎉 Seeding successfully completed!');
    return { success: true, message: 'Seeding completed' };
  }
}
