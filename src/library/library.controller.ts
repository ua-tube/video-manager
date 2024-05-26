import { Controller } from '@nestjs/common';
import { LibraryService } from './library.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { UpdateVideoVotesMetricsDto } from './dto';
import { ackMessage } from '../common/utils';

@Controller()
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @EventPattern('update_video_votes_metrics')
  async handleUpdateVideoVotesMetrics(
    @Payload() payload: UpdateVideoVotesMetricsDto,
    @Ctx() context: RmqContext,
  ) {
    await this.libraryService.updateVideoVotesMetrics(payload);
    ackMessage(context);
  }
}
