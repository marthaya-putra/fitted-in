import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { ResumeProfileService } from '../services/resume-profile.service';
import { CreateResumeProfileDto } from '../dto/create-resume-profile.dto';
import { UpdateResumeProfileDto } from '../dto/update-resume-profile.dto';
import { ResumeProfile } from '@/db/schema';
import { ResumeProfileRepository } from '@/database/repositories/resume-profile.repository';

@Controller('resume-profiles')
export class ResumeProfileController {
  constructor(private readonly resumeProfileService: ResumeProfileService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createResumeProfileDto: CreateResumeProfileDto,
  ): Promise<ResumeProfile> {
    console.log("process.env.DATABASE_URL: ", process.env.DATABASE_URL)
    return await this.resumeProfileService.create(createResumeProfileDto);
  }


  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<ResumeProfile> {
    return await this.resumeProfileService.findById(id);
  }

  @Get('account/:accountId')
  async findByAccountId(@Param('accountId', ParseIntPipe) accountId: number): Promise<ResumeProfile> {
    return await this.resumeProfileService.findByAccountId(accountId);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateResumeProfileDto: UpdateResumeProfileDto,
  ): Promise<ResumeProfile> {
    return await this.resumeProfileService.update(id, updateResumeProfileDto);
  }


}