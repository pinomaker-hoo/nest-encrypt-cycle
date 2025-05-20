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
    const url = req.url;
    const isEncrypted = req.headers['is-encrypted'] === 'Y';

    if (isEncrypted && req.body && req.body.data) {
      try {
        const decrypted = this.encryptService.decrypt(
          req.body.data,
          url,
          req.method,
        );
        req.body = JSON.parse(decrypted);
      } catch (err) {
        req.body = {};
      }
    }

    return next.handle().pipe(
      map((data) => {
        if (isEncrypted) {
          return this.encryptService.encrypt(
            JSON.stringify(data),
            url,
            req.method,
          );
        }
        return data;
      }),
    );
  }
}
