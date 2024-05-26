import { Controller } from '@nestjs/common';
import { HistoryService } from './history.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { UpdateVideoViewsMetricsDto } from './dto';
import { ackMessage } from '../common/utils';

@Controller()
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @EventPattern('update_video_views_metrics')
  async handleUpdateVideoViewsMetrics(
    @Payload() payload: UpdateVideoViewsMetricsDto,
    @Ctx() context: RmqContext,
  ) {
    await this.historyService.updateVideoViewsMetrics(payload);
    ackMessage(context);
  }
}
