# nest-encrypt-cycle

A NestJS interceptor that encrypts and decrypts request and response bodies effortlessly.

NPM : https://www.npmjs.com/package/nest-encrypt-cycle

---

## Features

- Transparent AES encryption/decryption of HTTP request and response payloads
- Easy integration as a global or route-scoped interceptor
- Secure data handling for sensitive information in NestJS APIs

---

## Installation

```bash
npm install nest-encrypt-cycle
```

## Usage

1. Import the module

```typescript
import { Module } from '@nestjs/common';
import { EncryptModule, EncryptInterceptor } from 'nest-encrypt-cycle';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [EncryptModule.register({ key: 'your-secret-key', whiteList: [] })],
})
export class AppModule {}
```

```typescript
export interface EncryptOptions {
  // Hash Key
  key: string;

  // API White List No Encrypt
  whiteList: {
    method: string;
    pathname: string;
  }[];
}
```

## Configuration

secretKey (string): Your AES encryption key. Must be 16, 24, or 32 bytes long.
