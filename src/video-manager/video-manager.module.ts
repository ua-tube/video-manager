import { Module } from '@nestjs/common';
import { VideoManagerService } from './video-manager.service';
import { PrismaModule } from '../prisma';
import { JwtModule } from '@nestjs/jwt';
import { VideoManagerGateway } from './video-manager.gateway';
import { ConfigService } from '@nestjs/config';
import { HealthController, RmqController, VideoManagerController } from './controllers';
import { EventEmitterModule } from '@nestjs/event-emitter';

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
  ],
  controllers: [VideoManagerController, RmqController, HealthController],
  providers: [VideoManagerService, VideoManagerGateway],
})
export class VideoManagerModule {}
