# Changelog

## 12.0.0

### Breaking changes

- Require Node.js >=24.11.0, NestJS 12 and ioredis 6. The health package requires Terminus 12.
- Replace `InjectRedis`, `InjectCluster`, `RedisManager` and `ClusterManager` with `RedisService` and `ClusterService`. Use `getOrThrow()` or `getOrNil()` to access a connection.
- Rename the default namespace constants to `DEFAULT_REDIS` and `DEFAULT_CLUSTER`, and the missing connection error to `ConnectionNotFoundError`.
- Return health indicator `down` results through the Terminus `HealthIndicatorService` API. Use `HealthCheckService.check()` for HTTP 503 responses.
- Enable Redis ready logging by default and include the upstream client creation hooks.

See the [migration guide](docs/upstream-migration.md) for examples.

### Maintenance

- Update the development toolchain to current stable releases, including Jest 30, ESLint 10 and pnpm 12. Use TypeScript 6.0.3, the latest release supported by both ts-jest and typescript-eslint.
- Test the full unit, Redis/Cluster E2E and application integration suites on Node.js 24 and 26 with Redis 8.
- Remove the unfinished node-redis workspace, unused dependencies and obsolete scripts.
