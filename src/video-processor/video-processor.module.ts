import { Module } from '@nestjs/common';
import { VideoProcessorService } from './video-processor.service';
import { VideoProcessorController } from './video-processor.controller';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '../prisma';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    PrismaModule
  ],
  controllers: [VideoProcessorController],
  providers: [VideoProcessorService],
})
export class VideoProcessorModule {}
