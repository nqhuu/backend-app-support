import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
    // async canActivate(context: any): Promise<boolean> {
    //     console.log('LocalAuthGuard triggered');
    //     const request = context.switchToHttp().getRequest();
    //     console.log('Request body:', request.body);
    //     return super.canActivate(context) as Promise<boolean>;
    // }
}