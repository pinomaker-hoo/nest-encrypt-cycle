# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`nest-encrypt-cycle` is a NestJS library that provides automatic encryption/decryption of HTTP request and response bodies using AES encryption. Published as an npm package.

## Build and Development Commands

```bash
# Build the project (compiles TypeScript to dist/)
npm run build

# Build before publishing (runs automatically)
npm run prepublishOnly
```

## Architecture

### Core Components

The library consists of three main parts that work together:

1. **EncryptModule** ([src/encrypt.module.ts](src/encrypt.module.ts)) - Dynamic NestJS module
   - Uses `.register()` pattern to accept `EncryptOptions` (encryption key + whitelist)
   - Creates singleton `EncryptService` instance with provided options
   - Auto-registers `EncryptInterceptor` as global interceptor via `APP_INTERCEPTOR`

2. **EncryptInterceptor** ([src/encrypt.interceptor.ts](src/encrypt.interceptor.ts)) - HTTP interceptor
   - Checks `is-encrypted: Y` header to determine if encryption is active
   - **Request phase**: Decrypts `req.body.data` before controller execution
   - **Response phase**: Encrypts response data after controller execution using RxJS `map()`
   - Skips already-encrypted responses (checks for `{encrypted: true, data: ...}` structure)

3. **EncryptService** ([src/encrypt.service.ts](src/encrypt.service.ts)) - Encryption logic
   - Uses Node.js native `crypto` module for AES-256-CBC encryption
   - Optimized with pre-allocated Buffers and Set-based whitelist (O(1) lookup)
   - Performance: 89-98.5% faster than crypto-js, ~9,600 ops/sec throughput
   - Whitelist feature: skips encryption/decryption for specific method+pathname combinations

### Request/Response Flow

```
Incoming Request → EncryptInterceptor.processRequest() → Decrypt req.body.data → Controller
Controller Response → EncryptInterceptor.processResponse() → Encrypt data → Outgoing Response
```

### Entry Point

[index.ts](index.ts) - Re-exports all public APIs (module, service, interceptor, types)

### Type Definitions

[src/types.ts](src/types.ts) - `EncryptOptions` interface defining configuration shape

## Key Implementation Details

- Encryption only activates when `is-encrypted: Y` header is present
- Whitelist entries match exact method (GET/POST/etc.) and pathname combinations
- Empty or missing request data results in empty object `{}` after decryption
- Response encryption returns encrypted string directly, not wrapped in object (unless already wrapped by controller)

## Publishing

- Package is published to npm as `nest-encrypt-cycle`
- Build output goes to `dist/` directory
- Main entry: `dist/index.js`, Types: `dist/index.d.ts`
