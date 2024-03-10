import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { UpsertCreatorDto } from './dto';
import { ClientRMQ } from '@nestjs/microservices';
import { USERS_SVC } from '../common/constants';

@Injectable()
export class CreatorsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CreatorsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(USERS_SVC)
    private readonly usersClient: ClientRMQ,
  ) {}

  onApplicationBootstrap(): void {
    this.usersClient
      .connect()
      .then(() => this.logger.log(`${USERS_SVC} connection established`))
      .catch(() => this.logger.error(`${USERS_SVC} connection failed`));
  }

  async upsertCreator(dto: UpsertCreatorDto) {
    const creator = await this.prisma.creator.findUnique({
      where: { id: dto.id },
      select: { id: true },
    });

    if (creator) {
      try {
        await this.prisma.creator.update({
          where: { id: dto.id },
          data: {
            displayName: dto.displayName,
            nickname: dto.nickname,
          },
        });
        this.logger.log(`Creator (${dto.id}) is updated`);
      } catch {
        this.logger.error(
          `An error occurred when updating creator (${dto.id})`,
        );
      }
    } else {
      try {
        await this.prisma.creator.create({ data: dto });
        this.usersClient.emit('creator_creation_success', {
          userId: dto.id,
          nickname: dto.nickname,
        });
        this.logger.log(`Creator (${dto.id}) is created`);
      } catch {
        this.usersClient.emit('creator_creation_failed', { id: dto.id });
        this.logger.error(
          `An error occurred when creating creator (${dto.id})`,
        );
      }
    }
  }
}
