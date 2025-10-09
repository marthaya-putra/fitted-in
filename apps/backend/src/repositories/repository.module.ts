import { Global, Module } from '@nestjs/common';
import { ResumeProfileRepository } from './resume-profile.repository';

@Global()
@Module({
  providers: [ResumeProfileRepository],
  exports: [ResumeProfileRepository],
})
export class RepositoryModule {}
