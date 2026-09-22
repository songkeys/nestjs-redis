const assert = require('node:assert/strict');
const { once } = require('node:events');
const { test } = require('node:test');
require('reflect-metadata');
const { Test } = require('@nestjs/testing');
const { TerminusModule, HealthCheckService } = require('@nestjs/terminus');
const { RedisModule, RedisService, ClusterModule, ClusterService } = require('../packages/redis/dist');
const { RedisHealthModule, RedisHealthIndicator } = require('../packages/redis-health/dist');

test('NestJS 12 and ioredis 6 support connections, health checks and shutdown', { timeout: 10000 }, async () => {
  const app = await Test.createTestingModule({
    imports: [
      RedisModule.forRootAsync({
        useFactory: () => ({
          readyLog: false,
          config: [{ port: 6380 }, { namespace: 'secondary', port: 6381 }]
        })
      }),
      ClusterModule.forRoot({
        readyLog: false,
        config: {
          nodes: [{ host: '127.0.0.1', port: 16380 }],
          redisOptions: { password: 'cluster1' }
        }
      }),
      TerminusModule,
      RedisHealthModule
    ]
  }).compile();
  await app.init();
  const manager = app.get(RedisService);
  const redis = manager.getOrThrow();
  const secondary = manager.getOrThrow('secondary');
  const cluster = app.get(ClusterService).getOrThrow();
  try {
    assert.throws(() => manager.getOrThrow('missing'));
    for (const client of [redis, secondary, cluster]) {
      assert.equal(await client.set('nestjs-redis:integration', 'ok', 'EX', 30), 'OK');
      assert.equal(await client.get('nestjs-redis:integration'), 'ok');
      await client.del('nestjs-redis:integration');
    }
    const indicator = await app.resolve(RedisHealthIndicator);
    const result = await app
      .get(HealthCheckService)
      .check([
        () => indicator.checkHealth('redis', { client: redis, type: 'redis' }),
        () => indicator.checkHealth('cluster', { client: cluster, type: 'cluster' })
      ]);
    assert.equal(result.status, 'ok');
    assert.equal(result.details.redis.status, 'up');
    assert.equal(result.details.cluster.status, 'up');
    await assert.rejects(
      app
        .get(HealthCheckService)
        .check([() => indicator.checkHealth('redis', { client: redis, type: 'redis', memoryThreshold: 0 })]),
      error => error.getStatus() === 503 && error.getResponse().error.redis.status === 'down'
    );
  } finally {
    const closed = Promise.all([redis, secondary, cluster].map(client => once(client, 'end')));
    await app.close();
    await closed;
  }
  for (const client of [redis, secondary, cluster]) {
    assert.ok(['end', 'close'].includes(client.status), client.status);
  }
});
