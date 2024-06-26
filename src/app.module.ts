import { Module } from '@nestjs/common';
import { VideoManagerModule } from './video-manager/video-manager.module';
import { ConfigModule } from '@nestjs/config';
import { CreatorsModule } from './creators/creators.module';
import Joi from 'joi';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './common/interceptors';
import { HealthModule } from './health/health.module';
import { VideoProcessorModule } from './video-processor/video-processor.module';
import { HistoryModule } from './history/history.module';
import { CommunityModule } from './community/community.module';
import { LibraryModule } from './library/library.module';
import { StorageModule } from './storage/storage.module';
import { VideoStoreModule } from './video-store/video-store.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.valid('development', 'production', 'test').required(),
        HTTP_HOST: Joi.string().required(),
        HTTP_PORT: Joi.number().required(),
        CLIENT_URL: Joi.string().required(),
        AUTH_SVC_URL: Joi.string().required(),
        REDIS_URL: Joi.string().required(),
        RABBITMQ_URL: Joi.string().required(),
        RABBITMQ_QUEUE: Joi.string().required(),
        RABBITMQ_USERS_QUEUE: Joi.string().required(),
        RABBITMQ_SEARCH_QUEUE: Joi.string().required(),
        RABBITMQ_LIBRARY_QUEUE: Joi.string().required(),
        RABBITMQ_HISTORY_QUEUE: Joi.string().required(),
        RABBITMQ_COMMUNITY_QUEUE: Joi.string().required(),
        RABBITMQ_VIDEO_STORE_QUEUE: Joi.string().required(),
        RABBITMQ_VIDEO_PROCESSOR_QUEUE: Joi.string().required(),
        DATABASE_URL: Joi.string().required(),
      }),
    }),
    HealthModule,
    VideoManagerModule,
    CreatorsModule,
    VideoProcessorModule,
    HistoryModule,
    CommunityModule,
    LibraryModule,
    StorageModule,
    VideoStoreModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
