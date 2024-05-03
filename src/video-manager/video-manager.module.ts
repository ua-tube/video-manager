import { Module } from '@nestjs/common';
import { VideoManagerService } from './video-manager.service';
import { PrismaModule } from '../prisma';
import { JwtModule } from '@nestjs/jwt';
import { VideoManagerGateway } from './video-manager.gateway';
import { ConfigService } from '@nestjs/config';
import { RmqController, VideoManagerController } from './controllers';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { COMMUNITY_SVC, LIBRARY_SVC } from '../common/constants';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          subject: 'upload-token',
          expiresIn: '5m',
          issuer: configService.get<string>('JWT_ISSUER'),
          audience: configService.get<string>('JWT_AUDIENCE'),
        },
        verifyOptions: {
          subject: 'upload-token',
          ignoreExpiration: false,
          issuer: configService.get<string>('JWT_ISSUER'),
          audience: configService.get<string>('JWT_AUDIENCE'),
        },
      }),
    }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    ClientsModule.registerAsync([
      {
        name: LIBRARY_SVC,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>('RABBITMQ_LIBRARY_QUEUE'),
            persistent: true,
            queueOptions: {
              durable: false,
            },
          },
        })
      },
      {
        name: COMMUNITY_SVC,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>('RABBITMQ_COMMUNITY_QUEUE'),
            persistent: true,
            queueOptions: {
              durable: false,
            },
          },
        })
      }
    ])
  ],
  controllers: [VideoManagerController, RmqController],
  providers: [VideoManagerService, VideoManagerGateway],
})
export class VideoManagerModule {}
