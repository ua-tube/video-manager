import { Module } from '@nestjs/common';
import { CreatorsService } from './creators.service';
import { CreatorsController } from './creators.controller';
import { PrismaModule } from '../prisma';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { USERS_SVC } from '../common/constants';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    ClientsModule.registerAsync([
      {
        name: USERS_SVC,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>('RABBITMQ_USERS_QUEUE'),
            persistent: true,
            queueOptions: {
              durable: false,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [CreatorsController],
  providers: [CreatorsService],
})
export class CreatorsModule {}
