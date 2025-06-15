import { Module } from '@nestjs/common';
import { ButtonsController } from './buttons.controller';
import { ButtonsService } from './buttons.service';

@Module({
  controllers: [ButtonsController],
  providers: [ButtonsService]
})
export class ButtonsModule {}
