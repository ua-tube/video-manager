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

@WebSocketGateway(Number(process.env.SOCKET_PORT), {
  cors: { origin: process.env.CLIENT_URL },
  transports: ['websocket', 'polling'],
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

    const room = `room-${user.id}`;
    await socket.join(room);
    this.logger.log(
      `User (${user.id}:${socket.id}) connected and join room: ${room}`,
    );
  }

  handleDisconnect(socket: Socket) {
    socket.disconnect();
    this.logger.log(`${socket.id} disconnected`);
  }
}
