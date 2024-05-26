import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { CommunityService } from './community.service';
import { ackMessage } from '../common/utils';
import { UpdateVideoCommentsMetricsDto } from './dto';

@Controller()
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @EventPattern('update_video_comments_metrics')
  async handleUpdateVideoCommentsMetrics(
    @Payload() payload: UpdateVideoCommentsMetricsDto,
    @Ctx() context: RmqContext,
  ) {
    await this.communityService.updateVideoCommentsMetrics(payload);
    ackMessage(context);
  }
}
