import { Module } from '@nestjs/common';
import { ApproximationsController } from './approximations.controller';
import { ApproximationsService } from './approximations.service';

@Module({
  controllers: [ApproximationsController],
  providers: [ApproximationsService]
})
export class ApproximationsModule {}
