import { IsString, IsOptional, IsNumber, IsEmail } from 'class-validator';

export class UpdateResumeProfileDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  workExperiences?: string;

  @IsString()
  @IsOptional()
  educations?: string;

  @IsString()
  @IsOptional()
  technicalSkills?: string;

  @IsNumber()
  @IsOptional()
  accountId?: number;
}