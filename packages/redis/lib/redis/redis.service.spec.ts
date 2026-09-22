import { Test, TestingModule } from '@nestjs/testing';
import { Redis } from 'ioredis';
import { RedisService } from './redis.service';
import { RedisClients } from './interfaces';
import { REDIS_CLIENTS, DEFAULT_REDIS } from './redis.constants';

jest.mock('ioredis', () => ({ Redis: jest.fn() }));

describe('RedisService', () => {
  let clients: RedisClients;
  let manager: RedisService;

  beforeEach(async () => {
    clients = new Map();
    clients.set(DEFAULT_REDIS, new Redis());
    clients.set('client1', new Redis());

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: REDIS_CLIENTS, useValue: clients }, RedisService]
    }).compile();

    manager = module.get<RedisService>(RedisService);
  });

  test('returns null for an unknown namespace', () => {
    expect(manager.getOrNil('missing')).toBeNull();
  });

  test('returns the same connection through getOrNil', () => {
    expect(manager.getOrNil('client1')).toBe(manager.getOrThrow('client1'));
  });

  test('should get a client with namespace', () => {
    const client = manager.getOrThrow('client1');
    expect(client).toBeDefined();
  });

  test('should get default client with namespace', () => {
    const client = manager.getOrThrow(DEFAULT_REDIS);
    expect(client).toBeDefined();
  });

  test('should get default client without namespace', () => {
    const client = manager.getOrThrow();
    expect(client).toBeDefined();
  });

  test('should throw an error when getting a client with an unknown namespace', () => {
    expect(() => manager.getOrThrow('')).toThrow();
  });
});
