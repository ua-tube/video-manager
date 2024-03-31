import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { UpsertCreator } from './types';
import { ClientRMQ } from '@nestjs/microservices';
import { USERS_SVC } from '../common/constants';

@Injectable()
export class CreatorsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CreatorsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(USERS_SVC)
    private readonly usersClient: ClientRMQ,
  ) {
  }

  onApplicationBootstrap(): void {
    this.usersClient
      .connect()
      .then(() => this.logger.log(`${USERS_SVC} connection established`))
      .catch(() => this.logger.error(`${USERS_SVC} connection failed`));
  }

  async upsertCreator(payload: UpsertCreator) {
    const creator = await this.prisma.creator.findUnique({
      where: { id: payload.id },
      select: { id: true },
    });

    if (creator) {
      try {
        await this.prisma.creator.update({
          where: { id: payload.id },
          data: {
            displayName: payload.displayName,
            nickname: payload.nickname,
          },
        });
        this.logger.log(`Creator (${payload.id}) is updated`);
      } catch {
        this.logger.error(
          `An error occurred when updating creator (${payload.id})`,
        );
      }
    } else {
      try {
        await this.prisma.creator.create({ data: payload });
        this.usersClient.emit('creator_creation_success', {
          userId: payload.id,
          nickname: payload.nickname,
        });
        this.logger.log(`Creator (${payload.id}) is created`);
        return { status: 1 }
      } catch {
        this.usersClient.emit('creator_creation_failed', { id: payload.id });
        this.logger.error(
          `An error occurred when creating creator (${payload.id})`,
        );
      }
    }
  }
}
