import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { EncryptService } from './encrypt.service';

@Injectable()
export class EncryptInterceptor implements NestInterceptor {
  constructor(private readonly encryptService: EncryptService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    if (req.body?.encrypted) {
      try {
        const decrypted = this.encryptService.decrypt(req.body.encrypted);
        req.body = JSON.parse(decrypted);
      } catch (err) {
        console.error('Decryption error:', err);
        req.body = {};
      }
    }

    return next.handle().pipe(
      map((data) => {
        const encrypted = this.encryptService.encrypt(JSON.stringify(data));
        return { encrypted };
      }),
    );
  }
}
