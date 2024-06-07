import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { isEmpty } from 'class-validator';

@Injectable()
export class AuthUserSseGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  public async canActivate(ctx: ExecutionContext): Promise<boolean> | never {
    const req = ctx.switchToHttp().getRequest();

    if (isEmpty(req.query.token)) {
      throw new UnauthorizedException({ code: 0 });
    }

    try {
      const { data } = await axios.get(
        this.configService.get<string>('AUTH_SVC_URL'),
        {
          headers: {
            Authorization: `Bearer ${req.query.token}`,
          },
        },
      );

      req.userId = data.id;

      return true;
    } catch {
      throw new UnauthorizedException({ code: 3 });
    }
  }
}
