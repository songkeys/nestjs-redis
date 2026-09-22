import { ModuleRef } from '@nestjs/core';
import { ClusterModule } from './cluster.module';
import { ClusterModuleAsyncOptions } from './interfaces';
import { logger } from './cluster-logger';
import { CLUSTER_MERGED_OPTIONS } from './cluster.constants';

jest.mock('./cluster-logger', () => ({
  logger: {
    error: jest.fn()
  }
}));

describe('forRoot', () => {
  test('should work correctly', () => {
    const module = ClusterModule.forRoot({ config: { nodes: [] } });
    expect(module.global).toBe(true);
    expect(module.module).toBe(ClusterModule);
    expect(module.providers?.length).toBeGreaterThanOrEqual(4);
    expect(module.exports?.length).toBeGreaterThanOrEqual(1);
  });
});

describe('forRootAsync', () => {
  test('should work correctly', () => {
    const options: ClusterModuleAsyncOptions = {
      imports: [],
      useFactory: () => ({ config: { nodes: [] } }),
      inject: [],
      extraProviders: [{ provide: '', useValue: '' }]
    };
    const module = ClusterModule.forRootAsync(options);
    expect(module.global).toBe(true);
    expect(module.module).toBe(ClusterModule);
    expect(module.imports).toBeArray();
    expect(module.providers?.length).toBeGreaterThanOrEqual(5);
    expect(module.exports?.length).toBeGreaterThanOrEqual(1);
  });

  test('without extraProviders', () => {
    const options: ClusterModuleAsyncOptions = {
      useFactory: () => ({ config: { nodes: [] } })
    };
    const module = ClusterModule.forRootAsync(options);
    expect(module.providers?.length).toBeGreaterThanOrEqual(4);
  });

  test('should throw an error', () => {
    expect(() => ClusterModule.forRootAsync({})).toThrow();
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
    const module = new ClusterModule({
      get: (token: unknown) => (token === CLUSTER_MERGED_OPTIONS ? { closeClient: true } : clients)
    } as ModuleRef);
    await module.onApplicationShutdown();
    expect(failed.quit).toHaveBeenCalledTimes(1);
    expect(ready.quit).toHaveBeenCalledTimes(1);
    expect(ended.quit).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith('failed: quit failed', expect.any(String));
  });
});
