import { Controller } from '@nestjs/common';
import { CreatorsService } from './creators.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { UpsertCreator } from './types';

@Controller('creators')
export class CreatorsController {
  constructor(private readonly creatorsService: CreatorsService) {
  }

  @MessagePattern('upsert_creator')
  async handleUpsertCreator(@Payload() payload: UpsertCreator) {
    return this.creatorsService.upsertCreator(payload);
  }
}
