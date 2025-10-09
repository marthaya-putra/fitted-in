import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { ResumeProfileRepository } from "../../repositories/resume-profile.repository";
import { Inject } from "@nestjs/common";
import { type Db } from "../../db/types";
import { type ResumeProfile } from "../../db/types";
import { resumeDto } from "../dto/create-resume.dto";
import { UpdateResumeDto } from "../dto/update-resume.dto";
import { DRIZZLE_DB } from "src/drizzle/drizzle.module";

@Injectable()
export class ResumeService {
  constructor(
    private readonly resumeProfileRepository: ResumeProfileRepository,
    @Inject(DRIZZLE_DB) private readonly db: Db
  ) {}

  async save(createResumeDto: resumeDto): Promise<ResumeProfile | null> {
    const existingProfile = await this.resumeProfileRepository.findByUserId(
      this.db,
      createResumeDto.userId
    );

    if (!createResumeDto.id) {
      throw new BadRequestException("id is required for update!");
    }

    if (existingProfile) {
      return this.resumeProfileRepository.update(
        this.db,
        createResumeDto.id,
        createResumeDto
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

  async findByUserId(userId: string): Promise<ResumeProfile | null> {
    return this.resumeProfileRepository.findByUserId(this.db, userId);
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

    // If userId is being updated, check if the new userId already has a profile
    if (
      updateResumeDto.userId &&
      updateResumeDto.userId !== existingProfile.userId
    ) {
      const existingProfileForUser =
        await this.resumeProfileRepository.findByUserId(
          this.db,
          updateResumeDto.userId
        );
      if (existingProfileForUser) {
        throw new ConflictException(
          `Resume profile for user ${updateResumeDto.userId} already exists`
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
