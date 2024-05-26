import { Logger, UnauthorizedException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { isEmpty } from 'class-validator';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ThumbnailProcessedEvent,
  VideoStatusChangedEvent,
  VideoStepProcessedEvent,
} from '../common/events';

@WebSocketGateway({
  cors: { origin: process.env.CLIENT_URL },
  transports: ['websocket', 'polling'],
  namespace: 'video-manager',
})
export class VideoManagerGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(VideoManagerGateway.name);

  @WebSocketServer()
  private server: Server;

  constructor(private readonly configService: ConfigService) {}

  async handleConnection(socket: Socket) {
    const handshakeAuthorization = socket?.handshake?.headers?.authorization;

    if (isEmpty(handshakeAuthorization)) {
      this.server.to(socket.id).emit('error', new UnauthorizedException());
      return socket.disconnect();
    }

    const split = handshakeAuthorization.split(' ');
    if (split.length < 2) {
      this.server.to(socket.id).emit('error', new UnauthorizedException());
      return socket.disconnect();
    }

    let user: { id: string };
    try {
      const { data } = await axios.get(
        this.configService.get<string>('AUTH_SVC_URL'),
        {
          headers: {
            Authorization: `Bearer ${split[1]}`,
          },
        },
      );
      user = data;
    } catch {
      this.server.to(socket.id).emit('error', new UnauthorizedException());
      return socket.disconnect();
    }

    const room = this.getRoomName(user.id);
    await socket.join(room);
    this.logger.log(
      `User (${user.id}:${socket.id}) connected and join room: ${room}`,
    );
  }

  handleDisconnect(socket: Socket) {
    socket.disconnect();
    this.logger.log(`${socket.id} disconnected`);
  }

  @OnEvent('video_status_changed', { async: true, promisify: true })
  async handleVideoStatusChanged(payload: VideoStatusChangedEvent) {
    this.logger.log(`video_status_changed emit to user (${payload.userId})`);
    this.server
      .to(this.getRoomName(payload.userId))
      .emit('video_status_changed', {
        videoId: payload.videoId,
        status: payload.status,
      });
  }

  @OnEvent('thumbnail_processed', { async: true, promisify: true })
  async handleThumbnailProcessed(payload: ThumbnailProcessedEvent) {
    this.logger.log(`thumbnail_processed emit to user (${payload.userId})`);
    this.server
      .to(this.getRoomName(payload.userId))
      .emit('thumbnail_processed', {
        videoId: payload.videoId,
        thumbnails: payload.thumbnails,
      });
  }

  @OnEvent('video_step_processed', { async: true, promisify: true })
  async handleVideoStepProcessed(payload: VideoStepProcessedEvent) {
    this.logger.log(`video_step_processed emit to user (${payload.userId})`);
    this.server
      .to(this.getRoomName(payload.userId))
      .emit('video_step_processed', {
        videoId: payload.videoId,
        label: payload.label,
      });
  }

  private getRoomName(userId: string) {
    return `room-${userId}`;
  }
}
