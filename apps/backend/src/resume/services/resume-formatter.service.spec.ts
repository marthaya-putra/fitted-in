import { Test, TestingModule } from '@nestjs/testing';
import { ResumeFormatterService } from './resume-formatter.service';

describe('ResumeFormatterService', () => {
  let service: ResumeFormatterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResumeFormatterService],
    }).compile();

    service = module.get<ResumeFormatterService>(ResumeFormatterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
