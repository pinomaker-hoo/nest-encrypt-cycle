import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto-js';
import { EncryptOptions } from './types';

@Injectable()
export class EncryptService {
  constructor(private readonly options: EncryptOptions) {}

  encrypt(data: string, pathname: string, method: string): string {
    if (
      this.options.whiteList.some(
        (i) => i.pathname === pathname && i.method === method,
      )
    ) {
      return data;
    }
    return crypto.AES.encrypt(data, crypto.enc.Utf8.parse(this.options.key), {
      iv: crypto.enc.Utf8.parse(this.options.key),
      padding: crypto.pad.Pkcs7,
      mode: crypto.mode.CBC,
    }).toString();
  }

  decrypt(data: string, pathname: string, method: string): string {
    if (
      this.options.whiteList.some(
        (i) => i.pathname === pathname && i.method === method,
      )
    ) {
      return data;
    }

    const decipher = crypto.AES.decrypt(
      data,
      crypto.enc.Utf8.parse(this.options.key),
      {
        iv: crypto.enc.Utf8.parse(this.options.key),
        padding: crypto.pad.Pkcs7,
        mode: crypto.mode.CBC,
      },
    );
    return decipher.toString(crypto.enc.Utf8);
  }
}
