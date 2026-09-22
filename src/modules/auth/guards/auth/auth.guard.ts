import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwksService } from '../../jwks/jwks.service.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwksService: JwksService) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }
    const token = authHeader.split(' ')[1];
    const userPayload = await this.jwksService.verifyToken(token);

    request.user = userPayload;

    return true;
  }
}
