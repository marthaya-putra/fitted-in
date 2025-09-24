import { Module } from '@nestjs/common';
import { ResumeProfileController } from './controllers/resume-profile.controller';
import { ResumeProfileService } from './services/resume-profile.service';
import { DatabaseModule } from '@/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ResumeProfileController],
  providers: [ResumeProfileService],
  exports: [ResumeProfileService],
})
export class ResumeProfileModule {}