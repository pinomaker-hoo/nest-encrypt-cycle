import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { EncryptOptions } from './types';

@Injectable()
export class EncryptService {
  constructor(private readonly options: EncryptOptions) {}

  encrypt(data: string): string {
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      this.options.key,
      this.options.iv,
    );
    return Buffer.concat([
      cipher.update(data, 'utf8'),
      cipher.final(),
    ]).toString('base64');
  }

  decrypt(base64: string): string {
    const encrypted = Buffer.from(base64, 'base64');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      this.options.key,
      this.options.iv,
    );
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString('utf8');
  }
}
