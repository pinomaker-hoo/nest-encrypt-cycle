import { Module, DynamicModule } from '@nestjs/common';
import { EncryptService } from './encrypt.service';
import { EncryptOptions } from './types';
import { EncryptInterceptor } from './encrypt.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({})
export class EncryptModule {
  static register(options: EncryptOptions): DynamicModule {
    const encryptService = new EncryptService(options);

    return {
      module: EncryptModule,
      providers: [
        {
          provide: EncryptService,
          useValue: encryptService,
        },
        {
          provide: APP_INTERCEPTOR,
          useClass: EncryptInterceptor,
        },
      ],
      exports: [EncryptService],
    };
  }
}
