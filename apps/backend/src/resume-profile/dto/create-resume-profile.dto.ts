import { IsString, IsOptional, IsNumber, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateResumeProfileDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

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
  @IsNotEmpty()
  accountId: number;
}