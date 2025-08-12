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
    if (!data || typeof data !== 'string') return '';

    return crypto.AES.encrypt(data, crypto.enc.Utf8.parse(this.options.key), {
      iv: crypto.enc.Utf8.parse(this.options.key),
      padding: crypto.pad.Pkcs7,
      mode: crypto.mode.CBC,
    }).toString();
  }

  decrypt(data: string, pathname: string, method: string): string {
    // Check whitelist first
    if (
      this.options.whiteList.some(
        (i) => i.pathname === pathname && i.method === method,
      )
    ) {
      return data;
    }
    
    // Strict validation to prevent crypto-js errors
    if (data === undefined || data === null) {
      return '';
    }
    
    if (typeof data !== 'string') {
      return '';
    }
    
    if (data.trim() === '') {
      return '';
    }

    // Verify data is in valid format before attempting to decrypt
    try {
      // Basic validation that the string looks like encrypted data
      if (!data.includes('/') && !data.includes('+') && !data.includes('=')) {
        return data; // Return as-is if it doesn't look encrypted
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
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  }
}
