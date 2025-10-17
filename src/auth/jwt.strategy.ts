import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your-super-secret-jwt-key',
    });
  }

  async validate(payload: any) {
    console.log('JWT Payload:', payload);
    const user = await this.authService.validateUser(payload.sub);
    console.log('Validated user:', user);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
