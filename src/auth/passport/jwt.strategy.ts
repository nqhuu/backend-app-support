import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUser } from 'src/users/users.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) { // 'jwt' dựa vào việc import { ExtractJwt, Strategy } from 'passport-jwt';
    constructor(
        private configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            // secretOrKey: configService.get<string>("JWT_ACCESS_TOKEN_SECRET")!,
            secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
        });
    }

    async validate(payload: IUser) {
        const { id, name, email, role } = payload;
        return {
            id,
            name,
            email,
            role
        };
    }
}