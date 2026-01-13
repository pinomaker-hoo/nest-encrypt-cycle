import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv } from 'crypto';
import { EncryptOptions } from './types';

@Injectable()
export class EncryptService {
  private readonly whitelistSet: Set<string>;
  private readonly whitelistPatterns: Array<{
    method: string;
    pattern: RegExp;
  }>;
  private readonly keyBuffer: Buffer;
  private readonly ivBuffer: Buffer;

  constructor(private readonly options: EncryptOptions) {
    // Whitelist를 정확 매칭용 Set과 패턴용 Array로 분리
    this.whitelistSet = new Set<string>();
    this.whitelistPatterns = [];

    for (const item of this.options.whiteList) {
      if (item.pathname.includes('*')) {
        // Wildcard 패턴을 RegExp로 변환
        // /api/users/* → /^\/api\/users\/[^/]+$/
        // /api/*/profile → /^\/api\/[^/]+\/profile$/
        const regexPattern = item.pathname
          .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // 특수문자 이스케이프
          .replace(/\*/g, '[^/]+'); // *를 "/"가 아닌 1개 이상 문자로 변환

        this.whitelistPatterns.push({
          method: item.method,
          pattern: new RegExp(`^${regexPattern}$`),
        });
      } else {
        // 정확 매칭은 Set에 저장 (O(1) 조회)
        this.whitelistSet.add(`${item.method}:${item.pathname}`);
      }
    }

    // Buffer를 미리 생성하여 매번 생성하는 오버헤드 제거
    this.keyBuffer = Buffer.from(this.options.key, 'utf8');
    // IV는 16 bytes 필요 (AES block size)
    this.ivBuffer = Buffer.from(this.options.key.slice(0, 16), 'utf8');
  }

  private isWhitelisted(pathname: string, method: string): boolean {
    // 1. 정확 매칭 확인 (O(1))
    if (this.whitelistSet.has(`${method}:${pathname}`)) {
      return true;
    }

    // 2. 패턴 매칭 확인 (O(n), n은 패턴 개수)
    for (const item of this.whitelistPatterns) {
      if (item.method === method && item.pattern.test(pathname)) {
        return true;
      }
    }

    return false;
  }

  encrypt(data: string, pathname: string, method: string): string {
    // Whitelist 확인 (정확 매칭 + 패턴 매칭)
    if (this.isWhitelisted(pathname, method)) {
      return data;
    }

    if (!data || typeof data !== 'string') return '';

    try {
      // Native crypto 사용 (crypto-js 대비 89-98.5% 빠름)
      const cipher = createCipheriv(
        'aes-256-cbc',
        this.keyBuffer,
        this.ivBuffer,
      );
      let encrypted = cipher.update(data, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', {
        pathname,
        method,
        error: error.message,
      });
      throw error;
    }
  }

  decrypt(data: string, pathname: string, method: string): string {
    // Whitelist 확인 (정확 매칭 + 패턴 매칭)
    if (this.isWhitelisted(pathname, method)) {
      return data;
    }

    if (!data || typeof data !== 'string') return '';

    try {
      // Native crypto 사용 (crypto-js 대비 89-98.5% 빠름)
      const decipher = createDecipheriv(
        'aes-256-cbc',
        this.keyBuffer,
        this.ivBuffer,
      );
      let decrypted = decipher.update(data, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', {
        pathname,
        method,
        error: error.message,
      });
      throw error;
    }
  }
}
