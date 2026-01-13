# nest-encrypt-cycle

A NestJS interceptor that encrypts and decrypts request and response bodies effortlessly.

NPM : https://www.npmjs.com/package/nest-encrypt-cycle

---

## Features

- **High Performance**: Native Node.js crypto module with ~9,600 ops/sec throughput (89-98.5% faster than crypto-js)
- **Wildcard Pattern Support**: Use `*` in whitelist paths to match dynamic segments (e.g., `/api/users/*`)
- Transparent AES-256-CBC encryption/decryption of HTTP request and response payloads
- Easy integration as a global or route-scoped interceptor
- Optimized whitelist lookup with O(1) complexity for exact matches
- Secure data handling for sensitive information in NestJS APIs
- Zero external dependencies (uses native crypto)

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
  // Hash Key (32 bytes for AES-256)
  key: string;

  // API White List - Routes that should NOT be encrypted
  whiteList: {
    method: string;    // HTTP method: 'GET', 'POST', etc.
    pathname: string;  // Path pattern: exact or with wildcards
  }[];
}
```

## Whitelist Configuration

The whitelist supports both **exact matching** and **wildcard patterns**:

### Exact Matching
```typescript
whiteList: [
  { method: 'GET', pathname: '/api/health' },
  { method: 'POST', pathname: '/api/webhook' },
]
```

### Wildcard Patterns
Use `*` to match any single path segment:

```typescript
whiteList: [
  // Match any user ID: /api/users/123, /api/users/abc, etc.
  { method: 'GET', pathname: '/api/users/*' },

  // Match any resource's profile: /api/users/profile, /api/admin/profile
  { method: 'GET', pathname: '/api/*/profile' },

  // Multiple wildcards: /api/users/posts/1, /api/admin/posts/2
  { method: 'POST', pathname: '/api/*/posts/*' },
]
```

**Notes:**
- `*` matches exactly **one** path segment (not including `/`)
- `/api/users/*` matches `/api/users/123` ✅ but NOT `/api/users/123/profile` ❌
- Query parameters are automatically ignored: `/api/users?id=1` matches `/api/users`
- Exact matches are checked first (O(1)), then wildcard patterns (O(n))

## Configuration

**key** (string): Your AES encryption key. Must be 16, 24, or 32 bytes long for AES-128/192/256.
