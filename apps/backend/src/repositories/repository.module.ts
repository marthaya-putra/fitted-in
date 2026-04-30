import { Global, Module } from "@nestjs/common";
import { ResumeProfileRepository } from "./resume-profile.repository";
import { PdfGenerationRepository } from "./pdf-generation.repository";

@Global()
@Module({
  providers: [ResumeProfileRepository, PdfGenerationRepository],
  exports: [ResumeProfileRepository, PdfGenerationRepository],
})
export class RepositoryModule {}
