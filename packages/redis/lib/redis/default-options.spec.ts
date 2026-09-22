import { defaultRedisModuleOptions } from './default-options';

describe('defaultRedisModuleOptions', () => {
  test('should validate the defaultRedisModuleOptions', () => {
    expect(defaultRedisModuleOptions.closeClient).toBe(true);
    expect(defaultRedisModuleOptions.readyLog).toBe(true);
    expect(defaultRedisModuleOptions.config).toEqual({});
    expect(defaultRedisModuleOptions.commonOptions).toBeUndefined();
  });
});
