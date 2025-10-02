import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { ResumeProfileRepository } from "@/database/repositories/resume-profile.repository";
import { Inject } from "@nestjs/common";
import { type Db, DB } from "@/database/types";
import { ResumeProfile } from "@/db/schema";
import { CreateResumeDto } from "../dto/create-resume.dto";
import { UpdateResumeDto } from "../dto/update-resume.dto";

@Injectable()
export class ResumeService {
  constructor(
    private readonly resumeProfileRepository: ResumeProfileRepository,
    @Inject(DB) private readonly db: Db
  ) {}

  async create(createResumeDto: CreateResumeDto): Promise<ResumeProfile> {
    // Check if resume profile already exists for this account
    const existingProfile = await this.resumeProfileRepository.findByAccountId(
      this.db,
      createResumeDto.accountId
    );

    if (existingProfile) {
      throw new ConflictException(
        `Resume profile for account ${createResumeDto.accountId} already exists`
      );
    }

    return await this.resumeProfileRepository.create(this.db, createResumeDto);
  }

  async findById(id: number): Promise<ResumeProfile> {
    const profile = await this.resumeProfileRepository.findAll(this.db);
    if (!profile) {
      throw new NotFoundException(`Resume profile with ID ${id} not found`);
    }
    return profile[0];
  }

  async findByAccountId(accountId: number): Promise<ResumeProfile> {
    const profile = await this.resumeProfileRepository.findByAccountId(
      this.db,
      accountId
    );
    if (!profile) {
      throw new NotFoundException(
        `Resume profile for account ${accountId} not found`
      );
    }
    return profile;
  }

  async update(
    id: number,
    updateResumeDto: UpdateResumeDto
  ): Promise<ResumeProfile> {
    // Check if profile exists
    const existingProfile = await this.resumeProfileRepository.findById(
      this.db,
      id
    );
    if (!existingProfile) {
      throw new NotFoundException(`Resume profile with ID ${id} not found`);
    }

    // If accountId is being updated, check if the new accountId already has a profile
    if (
      updateResumeDto.accountId &&
      updateResumeDto.accountId !== existingProfile.accountId
    ) {
      const existingProfileForAccount =
        await this.resumeProfileRepository.findByAccountId(
          this.db,
          updateResumeDto.accountId
        );
      if (existingProfileForAccount) {
        throw new ConflictException(
          `Resume profile for account ${updateResumeDto.accountId} already exists`
        );
      }
    }

    const updatedProfile = await this.resumeProfileRepository.update(
      this.db,
      id,
      updateResumeDto
    );
    if (!updatedProfile) {
      throw new NotFoundException(`Resume profile with ID ${id} not found`);
    }
    return updatedProfile;
  }
}
