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
    const method = req.method;
    const isEncrypted = req.headers['is-encrypted'] === 'Y';

    // 요청 단계: 컨트롤러 실행 전
    this.processRequest(req, url, method, isEncrypted);

    // 응답 단계: 컨트롤러 실행 후
    return next.handle().pipe(
      map((data) => {
        // 이미 암호화된 데이터인지 확인
        if (data && data.encrypted === true && data.data) {
          return data;
        }

        return this.processResponse(data, url, method, isEncrypted);
      }),
    );
  }

  // Request 처리를 위한 메서드 (비동기 처리 전)
  private processRequest(
    req: any,
    url: string,
    method: string,
    isEncrypted: boolean,
  ): void {
    // Only process encrypted requests with valid data
    if (!isEncrypted || !req.body || !req.body.data || 
        (typeof req.body.data === 'string' && req.body.data.trim() === '')) {
      return; // Skip processing for invalid data
    }

    try {
      const decrypted = this.encryptService.decrypt(
        req.body.data,
        url,
        method,
      );
      
      // Only parse if we got a non-empty result
      if (decrypted && decrypted.trim() !== '') {
        req.body = JSON.parse(decrypted);
      }
    } catch (err) {
      console.error('Request decryption failed:', err);
    }
  }

  // Response 처리를 위한 메서드 (비동기 처리 후)
  private processResponse(
    data: any,
    url: string,
    method: string,
    isEncrypted: boolean,
  ): any {
    if (isEncrypted) {
      return this.encryptService.encrypt(JSON.stringify(data), url, method);
    }

    return data;
  }
}
