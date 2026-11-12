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
import { PatientsService } from './patients.service.js';
import { CreatePatientDto } from './dto/create-patient.dto.js';
import { UpdatePatientDto } from './dto/update-patient.dto.js';
import { QueryPatientDto } from './dto/query-patient.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@ApiTags('Patients')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new patient' })
  @ApiResponse({ status: 201, description: 'Patient created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid doctor ID or input data' })
  async create(@Body() createPatientDto: CreatePatientDto) {
    const patient = await this.patientsService.create(createPatientDto);
    return {
      success: true,
      message: 'Patient created successfully',
      data: patient,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List all patients with pagination, search, and condition filters' })
  @ApiResponse({ status: 200, description: 'Paginated list of patients' })
  async findAll(@Query() queryDto: QueryPatientDto) {
    return this.patientsService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient by ID' })
  @ApiParam({ name: 'id', description: 'Patient MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Patient details' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update patient information' })
  @ApiParam({ name: 'id', description: 'Patient MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Patient updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    return this.patientsService.update(id, updatePatientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a patient' })
  @ApiParam({ name: 'id', description: 'Patient MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Patient deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }
}
