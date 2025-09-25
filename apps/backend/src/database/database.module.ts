import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { ResumeProfileRepository } from './repositories/resume-profile.repository';

@Global()
@Module({
  providers: [DatabaseService, ResumeProfileRepository],
  exports: [DatabaseService, ResumeProfileRepository],
})
export class DatabaseModule {}