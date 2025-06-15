import { Test, TestingModule } from '@nestjs/testing';
import { ApproximationsService } from './approximations.service';

describe('ApproximationsService', () => {
  let service: ApproximationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApproximationsService],
    }).compile();

    service = module.get<ApproximationsService>(ApproximationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
