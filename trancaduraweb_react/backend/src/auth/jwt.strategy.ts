import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          if (request && request.cookies) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
            return request.cookies['token'];
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: 'jwt_secret_key',
    });
  }

  validate(payload: {
    sub: number;
    username: string;
    email: string;
    isStaff: boolean;
  }) {
    return {
      userId: payload.sub,
      username: payload.username,
      email: payload.email,
      isStaff: payload.isStaff,
    };
  }
}
