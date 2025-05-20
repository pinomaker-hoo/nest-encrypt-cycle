# nest-encrypt

A NestJS interceptor that encrypts and decrypts request and response bodies effortlessly.

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
import { EncryptModule } from 'nest-encrypt-cycle';

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

2. Use the interceptor globally or on specific routes

Globally

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EncryptInterceptor } from 'nest-encrypt-cycle';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const encryptService = app.get(EncryptService);
  app.useGlobalInterceptors(new EncryptInterceptor(encryptService));
  await app.listen(3000);
}
bootstrap();
```

## Configuration

secretKey (string): Your AES encryption key. Must be 16, 24, or 32 bytes long.
