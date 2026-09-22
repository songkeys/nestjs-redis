import { ModuleRef } from '@nestjs/core';
import { RedisModule } from './redis.module';
import { RedisModuleAsyncOptions } from './interfaces';
import { logger } from './redis-logger';
import { REDIS_MERGED_OPTIONS } from './redis.constants';

jest.mock('./redis-logger', () => ({
  logger: {
    error: jest.fn()
  }
}));

describe('forRoot', () => {
  test('should work correctly', () => {
    const module = RedisModule.forRoot();
    expect(module.global).toBe(true);
    expect(module.module).toBe(RedisModule);
    expect(module.providers?.length).toBeGreaterThanOrEqual(4);
    expect(module.exports?.length).toBeGreaterThanOrEqual(1);
  });
});

describe('forRootAsync', () => {
  test('should work correctly', () => {
    const options: RedisModuleAsyncOptions = {
      imports: [],
      useFactory: () => ({}),
      inject: [],
      extraProviders: [{ provide: '', useValue: '' }]
    };
    const module = RedisModule.forRootAsync(options);
    expect(module.global).toBe(true);
    expect(module.module).toBe(RedisModule);
    expect(module.imports).toBeArray();
    expect(module.providers?.length).toBeGreaterThanOrEqual(5);
    expect(module.exports?.length).toBeGreaterThanOrEqual(1);
  });

  test('without extraProviders', () => {
    const options: RedisModuleAsyncOptions = {
      useFactory: () => ({})
    };
    const module = RedisModule.forRootAsync(options);
    expect(module.providers?.length).toBeGreaterThanOrEqual(4);
  });

  test('should throw an error', () => {
    expect(() => RedisModule.forRootAsync({})).toThrow();
  });
});

describe('onApplicationShutdown', () => {
  test('closes active connections and continues after a failed quit', async () => {
    const failed = {
      status: 'ready',
      quit: jest.fn().mockRejectedValue(new Error('quit failed')),
      removeListener: jest.fn()
    };
    const ready = { status: 'ready', quit: jest.fn().mockResolvedValue('OK'), removeListener: jest.fn() };
    const ended = { status: 'end', quit: jest.fn(), removeListener: jest.fn() };
    const clients = new Map([
      ['failed', failed],
      ['ready', ready],
      ['ended', ended]
    ]);
    const module = new RedisModule({
      get: (token: unknown) => (token === REDIS_MERGED_OPTIONS ? { closeClient: true } : clients)
    } as ModuleRef);
    await module.onApplicationShutdown();
    expect(failed.quit).toHaveBeenCalledTimes(1);
    expect(ready.quit).toHaveBeenCalledTimes(1);
    expect(ended.quit).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith('failed: quit failed', expect.any(String));
    expect(ready.removeListener).toHaveBeenCalledTimes(2);
    expect(failed.removeListener).toHaveBeenCalledTimes(2);
  });
});
