import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service.js';
import { CreateDoctorDto } from './dto/create-doctor.dto.js';
import { UpdateDoctorDto } from './dto/update-doctor.dto.js';
import { QueryDoctorDto } from './dto/query-doctor.dto.js';
import { CreatePatientDto } from '../patients/dto/create-patient.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@ApiTags('Doctors')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new doctor' })
  @ApiResponse({ status: 201, description: 'Doctor created successfully' })
  @ApiResponse({ status: 409, description: 'Doctor with this email already exists' })
  async create(@Body() createDoctorDto: CreateDoctorDto) {
    const doctor = await this.doctorsService.create(createDoctorDto);
    return {
      success: true,
      message: 'Doctor created successfully',
      data: doctor,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List all doctors with search, filters, and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of doctors' })
  async findAll(@Query() queryDto: QueryDoctorDto) {
    return this.doctorsService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get doctor by ID with assigned patient list' })
  @ApiParam({ name: 'id', description: 'Doctor MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Doctor details with patients' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update doctor information' })
  @ApiParam({ name: 'id', description: 'Doctor MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Doctor updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateDoctorDto: UpdateDoctorDto,
  ) {
    return this.doctorsService.update(id, updateDoctorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete doctor and associated patients' })
  @ApiParam({ name: 'id', description: 'Doctor MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Doctor deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.doctorsService.remove(id);
  }

  @Post(':id/patients')
  @ApiOperation({ summary: 'Add a new patient directly under a specific doctor' })
  @ApiParam({ name: 'id', description: 'Doctor MongoDB ObjectId' })
  @ApiResponse({ status: 201, description: 'Patient added under doctor successfully' })
  async addPatient(
    @Param('id') doctorId: string,
    @Body() patientDto: CreatePatientDto,
  ) {
    return this.doctorsService.addPatientUnderDoctor(doctorId, patientDto);
  }

  @Delete(':id/patients/:patientId')
  @ApiOperation({ summary: 'Remove a patient from a doctor’s list' })
  @ApiParam({ name: 'id', description: 'Doctor MongoDB ObjectId' })
  @ApiParam({ name: 'patientId', description: 'Patient MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Patient removed from doctor successfully' })
  async deletePatient(
    @Param('id') doctorId: string,
    @Param('patientId') patientId: string,
  ) {
    return this.doctorsService.deletePatientUnderDoctor(doctorId, patientId);
  }
}
