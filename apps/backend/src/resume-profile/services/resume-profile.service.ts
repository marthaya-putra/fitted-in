import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ResumeProfileRepository } from '@/database/repositories/resume-profile.repository';
import { DatabaseService } from '@/database/database.service';
import { ResumeProfile } from '@/db/schema';
import { CreateResumeProfileDto } from '../dto/create-resume-profile.dto';
import { UpdateResumeProfileDto } from '../dto/update-resume-profile.dto';

@Injectable()
export class ResumeProfileService {
  constructor(
    private readonly resumeProfileRepository: ResumeProfileRepository,
    private readonly databaseService: DatabaseService
  ) { }

  async create(createResumeProfileDto: CreateResumeProfileDto): Promise<ResumeProfile> {
    // Check if resume profile already exists for this account
    const existingProfile = await this.resumeProfileRepository.findByAccountId(
      this.databaseService.db,
      createResumeProfileDto.accountId,
    );

    if (existingProfile) {
      throw new ConflictException(`Resume profile for account ${createResumeProfileDto.accountId} already exists`);
    }

    return await this.resumeProfileRepository.create(this.databaseService.db, createResumeProfileDto);
  }


  async findById(id: number): Promise<ResumeProfile> {
    const profile = await this.resumeProfileRepository.findById(this.databaseService.db, id);
    if (!profile) {
      throw new NotFoundException(`Resume profile with ID ${id} not found`);
    }
    return profile;
  }

  async findByAccountId(accountId: number): Promise<ResumeProfile> {
    const profile = await this.resumeProfileRepository.findByAccountId(this.databaseService.db, accountId);
    if (!profile) {
      throw new NotFoundException(`Resume profile for account ${accountId} not found`);
    }
    return profile;
  }

  async update(id: number, updateResumeProfileDto: UpdateResumeProfileDto): Promise<ResumeProfile> {
    // Check if profile exists
    const existingProfile = await this.resumeProfileRepository.findById(this.databaseService.db, id);
    if (!existingProfile) {
      throw new NotFoundException(`Resume profile with ID ${id} not found`);
    }

    // If accountId is being updated, check if the new accountId already has a profile
    if (updateResumeProfileDto.accountId && updateResumeProfileDto.accountId !== existingProfile.accountId) {
      const existingProfileForAccount = await this.resumeProfileRepository.findByAccountId(
        this.databaseService.db,
        updateResumeProfileDto.accountId,
      );
      if (existingProfileForAccount) {
        throw new ConflictException(`Resume profile for account ${updateResumeProfileDto.accountId} already exists`);
      }
    }

    const updatedProfile = await this.resumeProfileRepository.update(this.databaseService.db, id, updateResumeProfileDto);
    if (!updatedProfile) {
      throw new NotFoundException(`Resume profile with ID ${id} not found`);
    }
    return updatedProfile;
  }

}