import { Module } from '@nestjs/common';
import { VideoManagerService } from './video-manager.service';
import { PrismaModule } from '../prisma';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { VideoManagerController } from './video-manager.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { videoManagerMicroserviceClients } from '../common/constants';

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
    PrismaModule,
    ClientsModule.registerAsync(
      videoManagerMicroserviceClients.map((item) => ({
        name: item[0],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>(`RABBITMQ_${item[1]}_QUEUE`),
            persistent: true,
            queueOptions: {
              durable: false,
            },
          },
        }),
      })),
    ),
  ],
  controllers: [VideoManagerController],
  providers: [VideoManagerService],
})
export class VideoManagerModule {}
