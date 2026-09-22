import { Test, TestingModule } from '@nestjs/testing';
import { HealthIndicatorService } from '@nestjs/terminus';
import Redis, { Cluster } from 'ioredis';
import { RedisHealthIndicator } from './redis.health';
import { FAILED_CLUSTER_STATE, CANNOT_BE_READ, ABNORMALLY_MEMORY_USAGE, OPERATIONS_TIMEOUT } from '@health/messages';

const mockPing = jest.fn();
const mockInfo = jest.fn();
const mockClusterInfo = jest.fn();
jest.mock('ioredis', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    ping: mockPing,
    info: mockInfo
  })),
  Cluster: jest.fn(() => ({
    cluster: mockClusterInfo
  }))
}));

describe('RedisHealthIndicator', () => {
  let redis: Redis;
  let cluster: Cluster;
  let indicator: RedisHealthIndicator;

  beforeEach(async () => {
    mockPing.mockReset();
    mockInfo.mockReset();
    mockClusterInfo.mockReset();
    redis = new Redis();
    cluster = new Cluster([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisHealthIndicator, HealthIndicatorService]
    }).compile();
    indicator = await module.resolve<RedisHealthIndicator>(RedisHealthIndicator);
  });

  describe('redis', () => {
    test('the status should be up', async () => {
      jest.spyOn(redis, 'ping').mockResolvedValue('PONG');
      jest.spyOn(redis, 'info').mockResolvedValue('# Memory used_memory:100000 used_memory_human:');

      await expect(
        indicator.checkHealth('redis', {
          type: 'redis',
          client: redis,
          timeout: 1000,
          memoryThreshold: 1024 * 1024 * 100
        })
      ).resolves.toEqual({
        redis: { status: 'up' }
      });
    });

    test('should throw an error if type is invalid', async () => {
      await expect(
        indicator.checkHealth('', { type: 'unknown' as unknown as 'redis', client: redis })
      ).rejects.toThrow();
    });

    test('should return down if ping is rejected', async () => {
      const message = 'a redis error';
      jest.spyOn(redis, 'ping').mockRejectedValue(new Error(message));

      await expect(indicator.checkHealth('', { type: 'redis', client: redis })).resolves.toEqual({
        '': { status: 'down', message }
      });
    });

    test('should return down if ping timed out', async () => {
      jest.useFakeTimers();

      const waitPromise = (ms: number) =>
        new Promise<string>(resolve => {
          setTimeout(() => resolve('PONG'), ms);
        });

      jest.spyOn(redis, 'ping').mockImplementation(() => waitPromise(2000));
      const promise = indicator.checkHealth('', { type: 'redis', client: redis });
      jest.runAllTimers();
      await expect(promise).resolves.toEqual({ '': { status: 'down', message: OPERATIONS_TIMEOUT(1000) } });
    });

    test('should return down if used memory is greater than threshold', async () => {
      jest.spyOn(redis, 'ping').mockResolvedValue('PONG');
      jest.spyOn(redis, 'info').mockResolvedValue('# Memory used_memory:101000 used_memory_human:');

      await expect(
        indicator.checkHealth('redis', { type: 'redis', client: redis, memoryThreshold: 1000 * 100 })
      ).resolves.toEqual({ redis: { status: 'down', message: ABNORMALLY_MEMORY_USAGE } });
    });
  });

  describe('cluster', () => {
    test('the status should be up', async () => {
      mockClusterInfo.mockResolvedValue('cluster_state:ok');

      await expect(indicator.checkHealth('cluster', { type: 'cluster', client: cluster })).resolves.toEqual({
        cluster: { status: 'up' }
      });
    });

    test('should return down on a connection error', async () => {
      const message = 'a redis error';
      mockClusterInfo.mockRejectedValue(new Error(message));

      await expect(indicator.checkHealth('', { type: 'cluster', client: cluster })).resolves.toEqual({
        '': { status: 'down', message }
      });
    });

    test('should return down if cluster info is null', async () => {
      mockClusterInfo.mockResolvedValue(null);

      await expect(indicator.checkHealth('', { type: 'cluster', client: cluster })).resolves.toEqual({
        '': { status: 'down', message: CANNOT_BE_READ }
      });
    });

    test('should return down if cluster info does not contain "cluster_state:ok"', async () => {
      mockClusterInfo.mockResolvedValue('cluster_state:fail');

      await expect(indicator.checkHealth('', { type: 'cluster', client: cluster })).resolves.toEqual({
        '': { status: 'down', message: FAILED_CLUSTER_STATE }
      });
    });
  });
});
