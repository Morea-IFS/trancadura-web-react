import { Test, TestingModule } from '@nestjs/testing';
import { ButtonsService } from './buttons.service';

describe('ButtonsService', () => {
  let service: ButtonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ButtonsService],
    }).compile();

    service = module.get<ButtonsService>(ButtonsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
