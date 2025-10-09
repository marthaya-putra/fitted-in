import {
  IsString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  IsEmail,
  IsUUID,
} from 'class-validator';

export class CreateResumeDto {
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
  skills?: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
