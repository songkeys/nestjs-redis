# Migrating to the upstream Service API

The upstream synchronization includes breaking API changes. The npm package names remain `@songkeys/nestjs-redis` and `@songkeys/nestjs-redis-health`.

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

The health package requires Terminus 11 or 12; Terminus 10 is no longer supported. `RedisHealthIndicator.checkHealth()` returns a `down` result on unhealthy connections. Use `HealthCheckService.check()` to produce the HTTP 503 response.

Choose a Node.js version supported by your NestJS and ioredis versions. Repository development and CI require Node.js 20 or newer.

The upstream `node-redis` package is an unfinished scaffold and is kept private.
