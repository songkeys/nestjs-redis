# Migrating to v12

Version 12 includes the upstream Service API and requires Node.js >=24.11.0, NestJS 12, and ioredis 6. The npm package names remain `@songkeys/nestjs-redis` and `@songkeys/nestjs-redis-health`.

| Previous API                                            | Current API                                                                   |
| ------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `@InjectRedis()` / `@InjectCluster()`                   | Inject `RedisService` / `ClusterService`                                      |
| `RedisManager` / `ClusterManager`                       | `RedisService` / `ClusterService`                                             |
| `getClient(namespace)`                                  | `getOrThrow(namespace)`; use `getOrNil(namespace)` for an optional connection |
| `DEFAULT_REDIS_NAMESPACE` / `DEFAULT_CLUSTER_NAMESPACE` | `DEFAULT_REDIS` / `DEFAULT_CLUSTER`                                           |
| `ClientNotFoundError`                                   | `ConnectionNotFoundError`                                                     |

```ts
import { Injectable } from '@nestjs/common';
import { RedisService } from '@songkeys/nestjs-redis';

@Injectable()
export class CacheService {
  constructor(private readonly redis: RedisService) {}

  async get(key: string) {
    return this.redis.getOrThrow().get(key);
  }
}
```

Redis configuration also supports `provide`, `beforeCreate`, and `created` callbacks. `onClientCreated` is deprecated upstream in favor of `created`. Redis ready logging now defaults to enabled.

The health package requires Terminus 12; older Terminus versions are no longer supported. `RedisHealthIndicator.checkHealth()` returns a `down` result on unhealthy connections. Use `HealthCheckService.check()` to produce the HTTP 503 response.

Repository development uses pnpm 12 and Node.js >=24.11.0. CI tests Node.js 24 and 26. NestJS 10/11 and ioredis 5 are no longer supported. ioredis 6 uses RESP3 by default.

The unfinished `node-redis` scaffold and its unused peer dependency have been removed. Both published packages use ioredis.
