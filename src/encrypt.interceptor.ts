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
    // Fastify와 Express 모두 지원
    const url = req.url || req.raw?.url;
    const method = req.method;
    // Query string 제거 (whitelist 매칭을 위해)
    const pathname = url.split('?')[0];
    // Fastify는 헤더를 소문자로 변환
    const isEncrypted = (req.headers['is-encrypted'] || req.headers['is-encrypted']) === 'Y';

    // 요청 단계: 컨트롤러 실행 전
    this.processRequest(req, pathname, method, isEncrypted);

    // 응답 단계: 컨트롤러 실행 후
    return next.handle().pipe(
      map((data) => {
        // 이미 암호화된 데이터인지 확인
        if (data && data.encrypted === true && data.data) {
          return data;
        }

        return this.processResponse(data, pathname, method, isEncrypted);
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
    // 암호화되지 않은 요청은 처리하지 않음
    if (!isEncrypted) {
      return;
    }

    // body가 없는 경우 처리 (Fastify는 body가 undefined일 수 있음)
    if (!req.body) {
      req.body = {};
      return;
    }

    // req.body.data가 없거나 빈 문자열인 경우 빈 객체로 처리
    if (
      !req.body.data ||
      (typeof req.body.data === 'string' && req.body.data.trim() === '')
    ) {
      return;
    }

    try {
      const decrypted = this.encryptService.decrypt(req.body.data, url, method);

      // 복호화된 결과가 있으면 파싱
      if (decrypted && decrypted.trim() !== '') {
        try {
          req.body = JSON.parse(decrypted);
        } catch (parseError) {
          console.error('JSON parsing failed:', parseError);
          req.body = {}; // 파싱 실패 시 빈 객체로 설정
        }
      } else {
        req.body = {}; // 복호화 결과가 없으면 빈 객체로 설정
      }
    } catch (err) {
      console.error('Request decryption failed:', err);
      req.body = {}; // 복호화 실패 시 빈 객체로 설정
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
