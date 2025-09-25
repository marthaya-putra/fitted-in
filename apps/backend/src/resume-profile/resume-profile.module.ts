import { Module } from '@nestjs/common';
import { ResumeProfileController } from './controllers/resume-profile.controller';
import { ResumeProfileService } from './services/resume-profile.service';

@Module({
  controllers: [ResumeProfileController],
  providers: [ResumeProfileService],
  exports: [ResumeProfileService],
})
export class ResumeProfileModule {}