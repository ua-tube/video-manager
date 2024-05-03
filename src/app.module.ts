import { Module } from '@nestjs/common';
import { VideoManagerModule } from './video-manager/video-manager.module';
import { ConfigModule } from '@nestjs/config';
import { CreatorsModule } from './creators/creators.module';
import Joi from 'joi';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './common/interceptors';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.valid('development', 'production', 'test').required(),
        CLIENT_URL: Joi.string().required(),
        HTTP_HOST: Joi.string().required(),
        HTTP_PORT: Joi.number().required(),
        AUTH_SVC_URL: Joi.string().required(),
        REDIS_URL: Joi.string().required(),
        RABBITMQ_URL: Joi.string().required(),
        RABBITMQ_QUEUE: Joi.string().required(),
        RABBITMQ_USERS_QUEUE: Joi.string().required(),
        RABBITMQ_LIBRARY_QUEUE: Joi.string().required(),
        RABBITMQ_COMMUNITY_QUEUE: Joi.string().required(),
        DATABASE_URL: Joi.string().required(),
      }),
    }),
    VideoManagerModule,
    CreatorsModule,
    HealthModule
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
