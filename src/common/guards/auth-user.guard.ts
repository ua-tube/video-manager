import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { isEmpty } from 'class-validator';
import { Request } from 'express';

@Injectable()
export class AuthUserGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  public async canActivate(ctx: ExecutionContext): Promise<boolean> | never {
    const req: Request = ctx.switchToHttp().getRequest();

    const authorizationHeader = req.headers['authorization'] || '';
    if (isEmpty(authorizationHeader)) {
      throw new UnauthorizedException();
    }

    const split = authorizationHeader.split(' ');
    if (split.length < 2) {
      throw new UnauthorizedException();
    }

    if (isEmpty(split[1])) throw new UnauthorizedException();

    try {
      const { data } = await axios.get(
        this.configService.get<string>('AUTH_SVC_URL'),
        {
          headers: {
            Authorization: `Bearer ${split[1]}`,
          },
        },
      );

      req.res.locals.userId = data.id;

      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
