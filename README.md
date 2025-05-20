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
import { EncryptModule } from 'pinomaker-nest-encrypt';

@Module({
  imports: [EncryptModule.register({ secretKey: 'your-secret-key' })],
})
export class AppModule {}
```

2. Use the interceptor globally or on specific routes

Globally

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EncryptInterceptor } from 'pinomaker-nest-encrypt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new EncryptInterceptor('your-secret-key'));
  await app.listen(3000);
}
bootstrap();
```

Per-route or controller

```typescript
import { Controller, UseInterceptors, Post, Body } from '@nestjs/common';
import { EncryptInterceptor } from 'pinomaker-nest-encrypt';

@Controller('secure')
@UseInterceptors(new EncryptInterceptor('your-secret-key'))
export class SecureController {
  @Post()
  async secureEndpoint(@Body() data: any) {
    // Your logic here
  }
}
```

## Configuration

secretKey (string): Your AES encryption key. Must be 16, 24, or 32 bytes long.
