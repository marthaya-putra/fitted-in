import { IsString, IsNotEmpty } from "class-validator";

export class CustomizeDto {
  @IsString()
  @IsNotEmpty()
  jobDescription: string;
}
