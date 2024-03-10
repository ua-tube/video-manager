import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication, Logger } from '@nestjs/common';
import { createAdapter, RedisAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { Server, ServerOptions } from 'socket.io';

export class RedisSocketIoAdapter extends IoAdapter {
  private readonly logger = new Logger(RedisSocketIoAdapter.name);

  protected readonly redisAdapter: (nsp: any) => RedisAdapter;

  constructor(app: INestApplication, redisConnectionUrl: string) {
    super(app);

    const pubClient = createClient({ url: redisConnectionUrl });
    const subClient = pubClient.duplicate();

    pubClient
      .connect()
      .then(() =>
        this.logger.log('Redis publisher client connection established'),
      );
    subClient
      .connect()
      .then(() =>
        this.logger.log('Redis subscriber client connection established'),
      );

    this.redisAdapter = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options) as Server;
    server.adapter(this.redisAdapter);
    return server;
  }
}
