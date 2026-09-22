const assert = require('node:assert/strict');
const { once } = require('node:events');
const { test } = require('node:test');
require('reflect-metadata');
const { Test } = require('@nestjs/testing');
const { TerminusModule, HealthCheckService } = require('@nestjs/terminus');
const { RedisModule, RedisService, ClusterModule, ClusterService } = require('../packages/redis/dist');
const { RedisHealthModule, RedisHealthIndicator } = require('../packages/redis-health/dist');

test('NestJS 12 and ioredis 6 support connections, health checks and shutdown', { timeout: 10000 }, async () => {
  for (const directory of ['../packages/redis', '../packages/redis-health']) {
    const { createRequire } = require('node:module');
    const resolve = createRequire(require.resolve(`${directory}/package.json`));
    const { readFileSync } = require('node:fs');
    const { dirname, join } = require('node:path');
    const core = JSON.parse(readFileSync(join(dirname(resolve.resolve('@nestjs/core')), 'package.json')));
    assert.match(core.version, /^12\./);
    assert.match(resolve('ioredis/package.json').version, /^6\./);
  }

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
      assert.equal(await client.set('nestjs-redis:compatibility', 'ok', 'EX', 30), 'OK');
      assert.equal(await client.get('nestjs-redis:compatibility'), 'ok');
      await client.del('nestjs-redis:compatibility');
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
