import { Test, TestingModule } from '@nestjs/testing';
import { ButtonsController } from './buttons.controller';

describe('ButtonsController', () => {
  let controller: ButtonsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ButtonsController],
    }).compile();

    controller = module.get<ButtonsController>(ButtonsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
